export type GameServerClientConfig = {
  /** REST base, e.g. `/game-server` or `http://localhost:8787` */
  apiBase: string
  /** Socket.IO path, e.g. `/game-server/socket.io` */
  socketPath: string
  /** When true, `io()` uses current page origin (Vite proxy). */
  usePageOrigin: boolean
}

/** Gerçek sunucu eşleşmesi — `.env` ile `VITE_XOX_ONLINE=true` yapın. */
export function isXoxOnlineEnabled() {
  return import.meta.env.VITE_XOX_ONLINE === 'true'
}

export function getGameServerClientConfig(): GameServerClientConfig {
  const explicit = import.meta.env.VITE_GAME_SERVER_URL as string | undefined
  if (explicit) {
    return {
      apiBase: explicit.replace(/\/$/, ''),
      socketPath: '/socket.io',
      usePageOrigin: false,
    }
  }
  if (import.meta.env.DEV) {
    return {
      apiBase: '/game-server',
      socketPath: '/game-server/socket.io',
      usePageOrigin: true,
    }
  }
  return {
    apiBase: 'http://localhost:8787',
    socketPath: '/socket.io',
    usePageOrigin: false,
  }
}

export function gameServerApiUrl(apiBase: string, path: string) {
  return `${apiBase}${path.startsWith('/') ? path : `/${path}`}`
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number },
) {
  const timeoutMs = init?.timeoutMs ?? 5000
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  const { timeoutMs: _ignored, ...requestInit } = init ?? {}

  try {
    return await fetch(input, { ...requestInit, signal: controller.signal })
  } finally {
    window.clearTimeout(timer)
  }
}
