import { AppShell } from "@hollis-labs/design-components"
import { useState } from "react"
import { ChatView } from "./components/ChatView"
import { SessionSidebar } from "./components/SessionSidebar"

export function App() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  return (
    <AppShell
      nav={
        <SessionSidebar
          activeSessionId={activeSessionId}
          onSelect={setActiveSessionId}
          onCreated={setActiveSessionId}
        />
      }
    >
      <ChatView sessionId={activeSessionId} />
    </AppShell>
  )
}
