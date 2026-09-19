import { Button, cn } from "@hollis-labs/design-components"
import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { type NaniteSession, naniteApi } from "../lib/nanite-api"

interface SessionSidebarProps {
  activeSessionId: string | null
  onSelect: (id: string) => void
  onCreated: (id: string) => void
}

/**
 * The backend does not guarantee last_activity order on GET /api/sessions.
 * Flux applies this exact client-side sort (LeftSidebar.tsx's
 * sortByActivity) and groups pinned sessions ahead of unpinned ones —
 * mirrored here after confirming live that a pinned-but-older session
 * ("Nanite - Atlas") sat below newer unpinned ones without it.
 */
function sortByActivity(a: NaniteSession, b: NaniteSession): number {
  return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
}

function SessionRow({
  session,
  active,
  onSelect,
}: {
  session: NaniteSession
  active: boolean
  onSelect: (id: string) => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(session.id)}
        className={cn(
          "w-full rounded-control px-3 py-2 text-left text-control transition-colors",
          active ? "bg-surface text-fg" : "text-fg-secondary hover:bg-surface-hover",
        )}
      >
        <div className="truncate">
          {/* custom_name is a deliberate operator label and outranks the
           * auto-generated title — matches Flux's own precedence
           * (LeftSidebar.tsx:619), confirmed live: the "Nanite - Atlas"
           * session's custom_name is what identifies it, not its title. */}
          {session.custom_name || session.title || session.short_code || session.id}
        </div>
        {session.provider ? (
          <div className="truncate text-caption text-fg-faint">
            {session.provider}
            {session.model ? ` · ${session.model}` : ""}
          </div>
        ) : null}
      </button>
    </li>
  )
}

export function SessionSidebar({ activeSessionId, onSelect, onCreated }: SessionSidebarProps) {
  const [sessions, setSessions] = useState<NaniteSession[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    naniteApi
      .listSessions()
      .then(setSessions)
      .finally(() => setLoading(false))
  }, [])

  const createSession = async () => {
    setCreating(true)
    try {
      const session = await naniteApi.createSession({})
      setSessions((prev) => [session, ...prev])
      onCreated(session.id)
    } finally {
      setCreating(false)
    }
  }

  const { pinned, unpinned } = useMemo(() => {
    const live = sessions.filter((s) => s.status !== "archived")
    return {
      pinned: live.filter((s) => s.is_pinned).sort(sortByActivity),
      unpinned: live.filter((s) => !s.is_pinned).sort(sortByActivity),
    }
  }, [sessions])

  const isEmpty = !loading && pinned.length === 0 && unpinned.length === 0

  return (
    <nav className="flex h-full w-64 flex-col border-r border-border-subtle bg-bg-elevated">
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-4 py-3">
        <span className="text-label font-semibold uppercase tracking-label text-fg-muted">
          Sessions
        </span>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={createSession}
          disabled={creating}
          aria-label="New session"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="p-2 text-caption text-fg-faint">Loading…</div>
        ) : isEmpty ? (
          <div className="p-2 text-caption text-fg-faint">No sessions yet.</div>
        ) : (
          <>
            {pinned.length > 0 ? (
              <>
                <div className="px-3 pt-1 pb-1 text-caption font-semibold uppercase tracking-label text-fg-faint">
                  Pinned
                </div>
                <ul className="flex flex-col gap-1">
                  {pinned.map((session) => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      active={session.id === activeSessionId}
                      onSelect={onSelect}
                    />
                  ))}
                </ul>
                <div className="my-2 border-t border-border-subtle" />
              </>
            ) : null}
            <ul className="flex flex-col gap-1">
              {unpinned.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  active={session.id === activeSessionId}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </nav>
  )
}
