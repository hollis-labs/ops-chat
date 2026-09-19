import type { ChatMessageItem } from "@hollis-labs/kit-chat"
import { ChatMarkdown } from "@hollis-labs/kit-chat/markdown"
import { useCallback, useEffect, useRef, useState } from "react"
import { type NaniteMessage, naniteApi } from "./nanite-api"

/**
 * SSE event shape, trimmed to what the MVP transcript needs. The live
 * backend (see Flux's useChat.ts) also emits tool_call/tool_result/
 * tool_warning/plugin_envelope/panel_signal/approval_request/status/
 * circuit_open/session_takeover — all deliberately out of scope for this
 * pass; the seam is the `es.addEventListener` list below, so wiring one in
 * later does not require touching the rest of the transport.
 */
interface StreamEventData {
  content?: string
  phase?: "narration" | "thinking" | "final"
  error?: string
  structured_error?: { message?: string }
}

/**
 * Persisted assistant content is a JSON-encoded StructuredMessage
 * (internal/chat/structured.go: {v, text, tier, hash, tool_calls,
 * envelopes, flags}), not plain text — confirmed by sending a real message
 * through this app and reading back what actually landed. Streamed deltas
 * arrive as plain text; only the persisted form is wrapped. Mirrors Flux's
 * own parseStructuredContent (ChatMessage.tsx) — .envelopes/.tool_calls are
 * deliberately not surfaced yet; that's the design-bindings/card slice this
 * MVP defers.
 */
function extractText(content: string): string {
  try {
    const parsed = JSON.parse(content) as { v?: number; text?: string }
    if (parsed && typeof parsed === "object" && parsed.v === 1 && typeof parsed.text === "string") {
      return parsed.text
    }
  } catch {
    // Not JSON — legacy raw text, or a user message (never wrapped).
  }
  return content
}

function toChatItem(message: NaniteMessage): ChatMessageItem {
  return {
    kind: "message",
    id: message.id,
    role: message.role,
    content: <ChatMarkdown>{extractText(message.content)}</ChatMarkdown>,
    timestamp: new Date(message.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

export function useNaniteChat(sessionId: string | null) {
  const [items, setItems] = useState<ChatMessageItem[]>([])
  const [partial, setPartial] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const accumulatedRef = useRef("")
  const eventSourceRef = useRef<EventSource | null>(null)

  const closeStream = useCallback(() => {
    eventSourceRef.current?.close()
    eventSourceRef.current = null
    setIsStreaming(false)
  }, [])

  // Load history whenever the selected session changes.
  useEffect(() => {
    closeStream()
    setItems([])
    setPartial(null)
    setError(null)
    accumulatedRef.current = ""
    if (!sessionId) return
    let canceled = false
    naniteApi
      .getSession(sessionId)
      .then(({ messages }) => {
        if (canceled) return
        setItems(messages.map(toChatItem))
      })
      .catch((err) => {
        if (canceled) return
        setError(err instanceof Error ? err.message : "Failed to load session")
      })
    return () => {
      canceled = true
    }
  }, [sessionId, closeStream])

  // Close the live stream on unmount so a dropped session never leaks a
  // connection or races a reconnect into stale state.
  useEffect(() => closeStream, [closeStream])

  const connectStream = useCallback(
    (streamUrl: string, targetSessionId: string) => {
      closeStream()
      const es = new EventSource(streamUrl)
      eventSourceRef.current = es
      setIsStreaming(true)

      const listen = (type: string, handler: (data: StreamEventData | null) => void) => {
        es.addEventListener(type, (event) => {
          if (eventSourceRef.current !== es) return // superseded — ignore
          let data: StreamEventData | null = null
          try {
            data = JSON.parse((event as MessageEvent).data) as StreamEventData
          } catch {
            // non-JSON payload — leave data null
          }
          handler(data)
        })
      }

      listen("delta", (data) => {
        if (!data?.content || data.phase === "narration" || data.phase === "thinking") return
        accumulatedRef.current += data.content
        setPartial(accumulatedRef.current)
      })

      listen("replace_content", (data) => {
        if (data?.content == null) return
        accumulatedRef.current = data.content
        setPartial(accumulatedRef.current)
      })

      listen("stream_end", () => {
        // Closed synchronously, in-handler — not via a React effect keyed on
        // state — so the browser's native EventSource auto-reconnect never
        // gets a chance to retry a message_id whose turn has already ended
        // (confirmed live: without this, a spurious reconnect ~3s later hits
        // a dead stream and reports an "error" after a successful reply).
        es.close()
        if (eventSourceRef.current === es) eventSourceRef.current = null
        setIsStreaming(false)
        void naniteApi.getSession(targetSessionId).then(({ messages }) => {
          setItems(messages.map(toChatItem))
          setPartial(null)
          accumulatedRef.current = ""
        })
      })

      listen("error", (data) => {
        es.close()
        if (eventSourceRef.current === es) eventSourceRef.current = null
        setIsStreaming(false)
        setError(
          data?.structured_error?.message ??
            data?.error ??
            "The response stream ended with an error.",
        )
        setPartial(null)
      })
    },
    [closeStream],
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId) return
      setError(null)
      const optimistic: ChatMessageItem = {
        kind: "message",
        id: `temp-${Date.now()}`,
        role: "user",
        content,
      }
      setItems((prev) => [...prev, optimistic])
      try {
        const { stream_url } = await naniteApi.sendMessage(sessionId, { content })
        accumulatedRef.current = ""
        setPartial("")
        connectStream(stream_url, sessionId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message")
      }
    },
    [sessionId, connectStream],
  )

  return {
    items,
    partial,
    isStreaming,
    error,
    sendMessage,
  }
}
