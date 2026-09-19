import { ApiError, createApiClient } from "@hollis-labs/design-app-runtime"

/**
 * Nanite's chat contract. Session creation and turn-sending go through
 * /api/harness/v1/* (internal/api/harness_v1.go) — confirmed directly with
 * Chrispian that the legacy POST /api/messages (+ GET /api/stream/:id) is
 * deprecated in favor of it. Session listing and message-history retrieval
 * (GET /api/sessions, GET /api/sessions/:id) stay on the plain REST surface;
 * harness v1's session/detail response has no messages array and
 * harnessV1Operations() lists no messages-list operation, so there is no
 * harness v1 replacement for history yet.
 */

/** Verified directly against the live backend (GET /api/sessions), not assumed. */
export interface NaniteSession {
  id: string
  short_code?: string
  title?: string
  custom_name?: string
  provider?: string
  model?: string
  status?: string
  message_count?: number
  is_pinned?: boolean
  last_activity: string
  created_at: string
  updated_at: string
}

export interface NaniteMessage {
  id: string
  session_id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
  created_at: string
}

export interface NaniteAgent {
  id: string
  name: string
  slug?: string
}

interface GetSessionResponse {
  session: NaniteSession
  messages: NaniteMessage[]
}

/** internal/api/harness_v1.go: harnessV1SessionResponse. `details` is a rich
 * readiness/runtime object this MVP doesn't need yet, so left untyped. */
interface HarnessSessionResponse {
  session: NaniteSession
  details: unknown
  stream_transport: string
}

/** internal/api/harness_v1.go: harnessV1TurnResponse. */
interface HarnessTurnResponse {
  session_id: string
  message_id: string
  stream_url: string
  raw_stream_url: string
  event_transport: string
  initial_activity_state: string
}

const client = createApiClient({ baseUrl: "/api" })

export const naniteApi = {
  listSessions: () => client.get<NaniteSession[]>("/sessions"),

  getSession: (id: string) => client.get<GetSessionResponse>(`/sessions/${id}`),

  createSession: async (data: {
    agent_id?: string
    provider?: string
    model?: string
  }): Promise<NaniteSession> => {
    const res = await client.post<HarnessSessionResponse>("/harness/v1/sessions", data)
    return res.session
  },

  sendMessage: (sessionId: string, data: { content: string; effort?: string }) =>
    client.post<HarnessTurnResponse>(`/harness/v1/sessions/${sessionId}/turns`, data),

  cancelTurn: (sessionId: string) =>
    client.post<{ session_id: string; status: string }>(
      `/harness/v1/sessions/${sessionId}/cancel`,
      {},
    ),

  listAgents: () => client.get<NaniteAgent[]>("/agents"),
}

export { ApiError }
