import { useCallback, useEffect, useRef, useState } from 'react'
import type { Socket } from '../gameSocketClient'
import { fetchWithTimeout, gameServerApiUrl, getGameServerClientConfig } from '../gameServerClient'

const AUTH_KEY = 'pm-game-auth-token-v1'
const NAME_KEY = 'pm-game-display-name-v1'

export type NeonSide = 'p1' | 'p2'

export type NeonLaneView = {
  paddleX: number
  ball: { x: number; y: number; active: boolean }
  bricks: number[]
  score: number
  lives: number
  wave: number
}

export type NeonEvent = {
  type: 'paddle' | 'brick' | 'crack' | 'steel' | 'life' | 'wave'
  side: NeonSide
  x?: number
  y?: number
  row?: number
  wave?: number
}

export type NeonState = {
  code: string
  status: 'waiting' | 'active' | 'ended'
  winner: NeonSide | 'draw' | null
  reason: string
  timeLeft: number
  p1: NeonLaneView
  p2: NeonLaneView
  events: NeonEvent[]
}

type Phase = 'lobby' | 'waiting' | 'play' | 'ended' | 'error'

export function useNeonBrickMatch() {
  const socketRef = useRef<Socket | null>(null)
  const paddleRef = useRef(0.5)
  const [phase, setPhase] = useState<Phase>('lobby')
  const [message, setMessage] = useState('İki telefon aynı oda koduyla bağlanır.')
  const [code, setCode] = useState('')
  const [side, setSide] = useState<NeonSide | null>(null)
  const [youName, setYouName] = useState('Oyuncu')
  const [opponentName, setOpponentName] = useState('')
  const [state, setState] = useState<NeonState | null>(null)

  const cleanup = useCallback(() => {
    socketRef.current?.disconnect()
    socketRef.current = null
  }, [])

  useEffect(() => cleanup, [cleanup])

  const connect = useCallback(async () => {
    if (socketRef.current?.connected) return socketRef.current
    const { createGameSocket } = await import('../gameSocketClient')
    const client = getGameServerClientConfig()
    const token = await ensureAuthToken(client.apiBase)
    const socket = client.usePageOrigin
      ? await createGameSocket({
          path: client.socketPath,
          transports: ['polling', 'websocket'],
          auth: { token },
          timeout: 5000,
          reconnection: false,
        })
      : await createGameSocket(client.apiBase, {
          path: client.socketPath,
          transports: ['polling', 'websocket'],
          auth: { token },
          timeout: 5000,
          reconnection: false,
        })
    socketRef.current = socket
    socket.on('neon:lobby', (payload) => {
      setCode(String(payload.code ?? ''))
      setSide(payload.side === 'p2' ? 'p2' : 'p1')
      setYouName(String(payload.you ?? 'Oyuncu'))
      setOpponentName(String(payload.opponent ?? ''))
      setPhase(payload.status === 'active' ? 'play' : 'waiting')
      setMessage(payload.status === 'active' ? 'Maç başladı' : 'Rakip bekleniyor')
    })
    socket.on('neon:state', (payload: NeonState) => {
      setState(payload)
      if (payload.status === 'active') setPhase('play')
      if (payload.status === 'ended') setPhase('ended')
    })
    socket.on('neon:error', (payload) => {
      setPhase('error')
      setMessage(String(payload?.message ?? 'Bağlantı kurulamadı'))
    })
    socket.on('connect_error', () => {
      setPhase('error')
      setMessage('Oyun sunucusuna bağlanılamadı. İki telefon da aynı sunucuda olmalı.')
    })
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('timeout')), 7000)
      socket.once('connect', () => {
        window.clearTimeout(timer)
        resolve()
      })
      socket.once('connect_error', () => {
        window.clearTimeout(timer)
        reject(new Error('connect_error'))
      })
    })
    return socket
  }, [])

  useEffect(() => {
    if (phase !== 'play') return
    const timer = window.setInterval(() => {
      socketRef.current?.emit('neon:input', { paddleX: paddleRef.current })
    }, 50)
    return () => window.clearInterval(timer)
  }, [phase])

  const createRoom = useCallback(async () => {
    setPhase('waiting')
    setMessage('Oda açılıyor...')
    setState(null)
    try {
      const socket = await connect()
      socket.emit('neon:create')
    } catch {
      setPhase('error')
      setMessage('Oyun sunucusuna bağlanılamadı.')
    }
  }, [connect])

  const joinRoom = useCallback(
    async (rawCode: string) => {
      const next = rawCode.trim().toLowerCase()
      if (next.length < 4) {
        setMessage('Dört haneli oda kodunu yaz.')
        return
      }
      setPhase('waiting')
      setMessage('Odaya giriliyor...')
      try {
        const socket = await connect()
        socket.emit('neon:join', { code: next })
      } catch {
        setPhase('error')
        setMessage('Oyun sunucusuna bağlanılamadı.')
      }
    },
    [connect],
  )

  const setPaddle = useCallback((paddleX: number) => {
    paddleRef.current = Math.max(0, Math.min(1, paddleX))
  }, [])

  const leave = useCallback(() => {
    cleanup()
    setPhase('lobby')
    setState(null)
    setCode('')
    setSide(null)
    setOpponentName('')
    setMessage('İki telefon aynı oda koduyla bağlanır.')
  }, [cleanup])

  return {
    phase,
    message,
    code,
    side,
    youName,
    opponentName,
    state,
    createRoom,
    joinRoom,
    setPaddle,
    leave,
  }
}

async function ensureAuthToken(apiBase: string) {
  const existing = window.localStorage.getItem(AUTH_KEY)
  if (existing) {
    const response = await fetchWithTimeout(gameServerApiUrl(apiBase, '/auth/validate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: existing }),
      timeoutMs: 4000,
    }).catch(() => null)
    if (response?.ok) return existing
    window.localStorage.removeItem(AUTH_KEY)
  }
  const displayName = window.localStorage.getItem(NAME_KEY) ?? `Oyuncu-${Math.floor(Math.random() * 900 + 100)}`
  window.localStorage.setItem(NAME_KEY, displayName)
  const response = await fetchWithTimeout(gameServerApiUrl(apiBase, '/auth/guest'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName }),
    timeoutMs: 5000,
  })
  if (!response.ok) throw new Error('auth_failed')
  const payload = await response.json()
  if (!payload?.token) throw new Error('auth_invalid')
  window.localStorage.setItem(AUTH_KEY, payload.token)
  return payload.token as string
}
