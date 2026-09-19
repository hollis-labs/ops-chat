import { EmptyState } from "@hollis-labs/design-components"
import type { ChatStreamStatus } from "@hollis-labs/kit-chat"
import { ChatInput, ChatStream, useStallDetector } from "@hollis-labs/kit-chat"
import { ChatMarkdown } from "@hollis-labs/kit-chat/markdown"
import { useState } from "react"
import { useNaniteChat } from "../lib/use-nanite-chat"

export function ChatView({ sessionId }: { sessionId: string | null }) {
  const [draft, setDraft] = useState("")
  const { items, partial, isStreaming, error, sendMessage } = useNaniteChat(sessionId)
  const stalled = useStallDetector(partial ?? "")

  if (!sessionId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          variant="empty"
          title="No session selected"
          description="Choose a session from the sidebar, or start a new one."
        />
      </div>
    )
  }

  const status: ChatStreamStatus = error
    ? { status: "error", message: error }
    : partial !== null
      ? {
          status: stalled ? "stalled" : "streaming",
          role: "assistant",
          content: <ChatMarkdown streaming={isStreaming}>{partial}</ChatMarkdown>,
        }
      : { status: "idle" }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatStream
        items={items}
        status={status}
        empty={
          <EmptyState
            variant="empty"
            title="No messages yet"
            description="Say something to get started."
          />
        }
      />
      <div className="border-t border-border-subtle p-4">
        <ChatInput
          value={draft}
          onValueChange={setDraft}
          onSubmit={(value) => {
            setDraft("")
            void sendMessage(value)
          }}
          busy={isStreaming}
          placeholder="Message this agent…"
        />
      </div>
    </div>
  )
}
