import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Socket } from './gameSocketClient'
import {
  fetchWithTimeout,
  gameServerApiUrl,
  getGameServerClientConfig,
  isXoxOnlineEnabled,
} from './gameServerClient'
import { applyMove, emptyBoard, getWinner, pickBotMove } from './utils/xoxEngine'
import type { XoxBoard } from './utils/xoxLogic'

const PROTOCOL_VERSION = '1.0.0'
const GAME = 'xox'
const AUTH_KEY = 'pm-game-auth-token-v1'
const NAME_KEY = 'pm-game-display-name-v1'

type MatchResult = 'win' | 'lose' | 'draw'

type RoomState = {
  roomId: string
  board: (null | 'X' | 'O')[]
  turn: 'X' | 'O'
  winner: null | 'X' | 'O' | 'draw'
  status: 'idle' | 'queueing' | 'active' | 'ended'
}

type MatchIdentity = {
  roomId: string
  mySymbol: 'X' | 'O'
  opponentName: string
  opponentIsBot?: boolean
}

type UseXoxRealtimeOptions = {
  onMatchXp: (payload: { result: MatchResult; xpAward: number }) => void
}

const DEFAULT_ROOM: RoomState = {
  roomId: '',
  board: Array(9).fill(null),
  turn: 'X',
  winner: null,
  status: 'idle',
}

const CONNECT_TIMEOUT_MS = 7000
const LOCAL_MATCH_DELAY_MS = 280
const LOCAL_BOT_NAMES = ['PlayBot', 'Neo-X', 'XO-Bot', 'Deneme Botu']
const XP_ON_WIN = 220
const XP_ON_DRAW = 90

export function useXoxRealtime({ onMatchXp }: UseXoxRealtimeOptions) {
  const onMatchXpRef = useRef(onMatchXp)
  onMatchXpRef.current = onMatchXp

  const socketRef = useRef<Socket | null>(null)
  const connectTimerRef = useRef<number | null>(null)
  const botTimerRef = useRef<number | null>(null)
  const localMatchTimerRef = useRef<number | null>(null)
  const [transport, setTransport] = useState<'online' | 'local'>('online')
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'authenticating' | 'queueing' | 'matched' | 'ended' | 'error'>('idle')
  const [message, setMessage] = useState<string>('Hazır')
  const [room, setRoom] = useState<RoomState>(DEFAULT_ROOM)
  const [identity, setIdentity] = useState<MatchIdentity | null>(null)
  const [lastResult, setLastResult] = useState<MatchResult | null>(null)

  const canPlay = useMemo(() => {
    if (!visible || phase !== 'matched' || room.status !== 'active' || room.winner) return false
    if (transport === 'local') return room.turn === 'X'
    return identity?.mySymbol === room.turn
  }, [identity?.mySymbol, phase, room.status, room.turn, room.winner, transport, visible])

  const clearConnectTimer = useCallback(() => {
    if (connectTimerRef.current != null) {
      window.clearTimeout(connectTimerRef.current)
      connectTimerRef.current = null
    }
  }, [])

  const clearBotTimer = useCallback(() => {
    if (botTimerRef.current != null) {
      window.clearTimeout(botTimerRef.current)
      botTimerRef.current = null
    }
  }, [])

  const clearLocalMatchTimer = useCallback(() => {
    if (localMatchTimerRef.current != null) {
      window.clearTimeout(localMatchTimerRef.current)
      localMatchTimerRef.current = null
    }
  }, [])

  const cleanupSocket = useCallback(() => {
    clearConnectTimer()
    socketRef.current?.disconnect()
    socketRef.current = null
  }, [clearConnectTimer])

  useEffect(() => {
    return () => {
      cleanupSocket()
      clearBotTimer()
      clearLocalMatchTimer()
    }
  }, [cleanupSocket, clearBotTimer, clearLocalMatchTimer])

  const finishLocalMatch = useCallback(
    (board: XoxBoard) => {
      const winner = getWinner(board)
      if (!winner) return false

      setRoom((current) => ({
        ...current,
        board,
        winner,
        status: 'ended',
      }))
      setPhase('ended')
      if (winner === 'draw') {
        setLastResult('draw')
        setMessage('Berabere! Güzel maçtı.')
        onMatchXpRef.current({ result: 'draw', xpAward: XP_ON_DRAW })
      } else if (winner === 'X') {
        setLastResult('win')
        setMessage('Kazandın! 🎉')
        onMatchXpRef.current({ result: 'win', xpAward: XP_ON_WIN })
      } else {
        setLastResult('lose')
        setMessage('Bu maçı kaybettin. Rövanş?')
      }
      return true
    },
    [],
  )

  const scheduleLocalBot = useCallback(
    (board: XoxBoard) => {
      clearBotTimer()
      const delay = 380 + Math.floor(Math.random() * 420)
      botTimerRef.current = window.setTimeout(() => {
        botTimerRef.current = null
        const index = pickBotMove(board, 'O', 'X')
        if (index == null || board[index] != null) return

        const afterBot = applyMove(board, 'O', index)
        if (finishLocalMatch(afterBot)) return

        setRoom((current) => ({
          ...current,
          board: afterBot,
          turn: 'X',
          status: 'active',
        }))
      }, delay)
    },
    [clearBotTimer, finishLocalMatch],
  )

  const startLocalBotMatch = useCallback(() => {
    cleanupSocket()
    clearBotTimer()
    clearLocalMatchTimer()
    setTransport('local')
    setPhase('queueing')
    setMessage('Bot ile eşleşiliyor...')
    setRoom({
      roomId: `local_${Date.now()}`,
      board: emptyBoard(),
      turn: 'X',
      winner: null,
      status: 'active',
    })
    const botName = LOCAL_BOT_NAMES[Math.floor(Math.random() * LOCAL_BOT_NAMES.length)]
    setIdentity({
      roomId: 'local',
      mySymbol: 'X',
      opponentName: botName,
      opponentIsBot: true,
    })

    localMatchTimerRef.current = window.setTimeout(() => {
      localMatchTimerRef.current = null
      setPhase('matched')
      setMessage(`Bot hazır: ${botName}`)
    }, LOCAL_MATCH_DELAY_MS)
  }, [cleanupSocket, clearBotTimer, clearLocalMatchTimer])

  const open = useCallback(async () => {
    setVisible(true)
    setLastResult(null)
    clearBotTimer()

    if (!isXoxOnlineEnabled()) {
      startLocalBotMatch()
      return
    }

    setTransport('online')
    setPhase('authenticating')
    setMessage('Kimlik doğrulanıyor...')
    setRoom(DEFAULT_ROOM)
    setIdentity(null)

    try {
      const { createGameSocket } = await import('./gameSocketClient')
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

      connectTimerRef.current = window.setTimeout(() => {
        if (socket.connected) return
        startLocalBotMatch()
      }, CONNECT_TIMEOUT_MS)

      socket.on('connect', () => {
        clearConnectTimer()
        setPhase('queueing')
        setMessage('Bot ile eşleşiliyor...')
        socket.emit('queue:join', {
          protocolVersion: PROTOCOL_VERSION,
          game: GAME,
          preferBot: true,
        })
      })

      socket.on('match:found', (payload) => {
        clearConnectTimer()
        if (payload.protocolVersion !== PROTOCOL_VERSION) {
          setPhase('error')
          setMessage('Sürüm uyumsuzluğu.')
          return
        }
        setTransport('online')
        setPhase('matched')
        const opponentIsBot = Boolean(payload.opponent?.isBot)
        setIdentity({
          roomId: payload.roomId,
          mySymbol: payload.you.symbol,
          opponentName: payload.opponent.displayName,
          opponentIsBot,
        })
        setMessage(
          opponentIsBot
            ? `Bot hazır: ${payload.opponent.displayName}`
            : `Rakip bulundu: ${payload.opponent.displayName}`,
        )
      })

      socket.on('room:state', (payload) => {
        if (payload.protocolVersion !== PROTOCOL_VERSION) return
        if (!payload.roomId) return
        setRoom({
          roomId: payload.roomId,
          board: payload.board,
          turn: payload.turn,
          winner: payload.winner,
          status: payload.status,
        })
      })

      socket.on('match:end', (payload) => {
        if (payload.protocolVersion !== PROTOCOL_VERSION) return
        if (payload.result === 'win' || payload.result === 'lose' || payload.result === 'draw') {
          setPhase('ended')
          setLastResult(payload.result)
          setMessage(getResultMessage(payload.result, payload.reason))
          onMatchXpRef.current({ result: payload.result, xpAward: Number(payload.xpAward ?? 0) })
          return
        }
        setPhase('error')
        setMessage('Bağlantı hatası oluştu. Tekrar deneyin.')
      })

      socket.on('connect_error', async (error: Error) => {
        clearConnectTimer()
        const authFailed =
          error.message.includes('AUTH') ||
          error.message.includes('auth') ||
          error.message.includes('unauthorized')

        if (authFailed) {
          window.localStorage.removeItem(AUTH_KEY)
          setMessage('Oturum yenileniyor...')
          try {
            const freshToken = await ensureAuthToken(client.apiBase, { forceNew: true })
            socket.auth = { token: freshToken }
            socket.connect()
            return
          } catch {
            startLocalBotMatch()
            return
          }
        }

        startLocalBotMatch()
      })
    } catch {
      startLocalBotMatch()
    }
  }, [clearBotTimer, clearConnectTimer, startLocalBotMatch])

  const close = useCallback(() => {
    setVisible(false)
    setPhase('idle')
    setMessage('Hazır')
    setRoom(DEFAULT_ROOM)
    setIdentity(null)
    setLastResult(null)
    setTransport('online')
    cleanupSocket()
    clearBotTimer()
    clearLocalMatchTimer()
  }, [cleanupSocket, clearBotTimer, clearLocalMatchTimer])

  const submitMove = useCallback(
    (index: number) => {
      if (!visible || room.board[index] != null) return

      if (transport === 'local') {
        if (phase !== 'matched' || room.status !== 'active' || room.turn !== 'X') return
        const afterPlayer = applyMove(room.board, 'X', index)
        if (finishLocalMatch(afterPlayer)) return
        setRoom((current) => ({
          ...current,
          board: afterPlayer,
          turn: 'O',
        }))
        scheduleLocalBot(afterPlayer)
        return
      }

      if (!canPlay || !identity) return
      socketRef.current?.emit('move:submit', {
        protocolVersion: PROTOCOL_VERSION,
        roomId: identity.roomId,
        index,
      })
    },
    [canPlay, finishLocalMatch, identity, phase, room.board, room.status, room.turn, scheduleLocalBot, transport, visible],
  )

  return {
    visible,
    phase,
    message,
    room,
    identity,
    canPlay,
    lastResult,
    open,
    close,
    submitMove,
    transport,
  }
}

async function ensureAuthToken(apiBase: string, options?: { forceNew?: boolean }) {
  if (!options?.forceNew) {
    const existing = window.localStorage.getItem(AUTH_KEY)
    if (existing) {
      const valid = await validateAuthToken(apiBase, existing)
      if (valid) return existing
      window.localStorage.removeItem(AUTH_KEY)
    }
  } else {
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
  if (!response.ok) {
    throw new Error('auth_failed')
  }
  const payload = await response.json()
  if (!payload?.token) {
    throw new Error('auth_invalid')
  }
  window.localStorage.setItem(AUTH_KEY, payload.token)
  return payload.token
}

async function validateAuthToken(apiBase: string, token: string) {
  try {
    const response = await fetchWithTimeout(gameServerApiUrl(apiBase, '/auth/validate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      timeoutMs: 4000,
    })
    return response.ok
  } catch {
    return false
  }
}

function getResultMessage(result: MatchResult, reason: string) {
  if (result === 'win' && reason === 'OPPONENT_DISCONNECTED') return 'Rakip bağlantıyı kesti. Kazandın!'
  if (result === 'win') return 'Kazandın! 🎉'
  if (result === 'draw') return 'Berabere! Güzel maçtı.'
  return 'Bu maçı kaybettin. Rövanş?'
}
