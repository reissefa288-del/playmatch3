import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { customAlphabet } from 'nanoid'
import { Server } from 'socket.io'

const PORT = Number.parseInt(process.env.GAME_SERVER_PORT ?? '8787', 10)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'
const ALLOWED_ORIGINS = new Set([
  CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
])

const DEV_CLIENT_PORTS = new Set(['5173', '5174', '5175', '3000'])

function isAllowedOrigin(origin) {
  if (!origin) return true
  if (ALLOWED_ORIGINS.has(origin)) return true
  try {
    const url = new URL(origin)
    if (!DEV_CLIENT_PORTS.has(url.port || '80')) return false
    const host = url.hostname
    if (host === 'localhost' || host === '127.0.0.1') return true
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true
  } catch {
    return false
  }
  return false
}
const PROTOCOL_VERSION = '1.0.0'
const XP_ON_WIN = 220
const XP_ON_DRAW = 90
const BOT_MATCH_DELAY_MS = 650
const BOT_MOVE_MIN_MS = 380
const BOT_MOVE_JITTER_MS = 420
const BOT_DISPLAY_NAMES = ['PlayBot', 'Neo-X', 'Deneme Botu', 'XO-Bot']

const app = express()
app.use(express.json())
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  },
})

const makeId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10)
const randomName = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ', 2)

/** @type {Map<string, {userId: string, displayName: string, issuedAt: number}>} */
const sessions = new Map()
/** @type {Map<string, number[]>} */
const ipLimiter = new Map()
/** @type {string[]} */
const queue = []
/** @type {Map<string, {id: string, protocolVersion: string, board: (null | 'X' | 'O')[], turn: 'X' | 'O', status: 'active' | 'ended', moves: number, winner: null | 'X' | 'O' | 'draw', players: {socketId: string, userId: string, displayName: string, symbol: 'X' | 'O'}[]}>} */
const rooms = new Map()
/** @type {Map<string, string>} */
const socketToRoom = new Map()
/** @type {Map<string, {joinAt: number, moveAt: number}>} */
const socketRate = new Map()
/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const botMatchTimers = new Map()
/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const botMoveTimers = new Map()

app.get('/health', (_, res) => {
  res.json({
    ok: true,
    protocolVersion: PROTOCOL_VERSION,
    queueSize: queue.length,
    activeRooms: [...rooms.values()].filter((room) => room.status === 'active').length,
  })
})

app.get('/', (_, res) => {
  res.status(200).json({
    ok: true,
    message: 'PlayMeet game server is running.',
    usage: {
      health: '/health',
      authGuest: 'POST /auth/guest',
      socketIoPath: '/socket.io',
    },
  })
})

app.post('/auth/guest', (req, res) => {
  const ip = req.ip ?? 'unknown'
  const now = Date.now()
  const entries = (ipLimiter.get(ip) ?? []).filter((t) => now - t < 60_000)
  if (entries.length >= 20) {
    res.status(429).json({ ok: false, message: 'Too many auth requests.' })
    return
  }
  entries.push(now)
  ipLimiter.set(ip, entries)

  const displayNameRaw = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : ''
  const displayName = displayNameRaw ? displayNameRaw.slice(0, 24) : `Oyuncu-${randomName()}`
  const userId = `u_${makeId()}`
  const token = `pm_${makeId()}${makeId()}`
  sessions.set(token, { userId, displayName, issuedAt: now })

  res.json({
    ok: true,
    token,
    user: { userId, displayName },
    protocolVersion: PROTOCOL_VERSION,
  })
})

app.post('/auth/validate', (req, res) => {
  const token = typeof req.body?.token === 'string' ? req.body.token : ''
  if (!token || !sessions.has(token)) {
    res.status(401).json({ ok: false })
    return
  }
  const user = sessions.get(token)
  res.json({
    ok: true,
    user: { userId: user.userId, displayName: user.displayName },
    protocolVersion: PROTOCOL_VERSION,
  })
})

io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (typeof token !== 'string' || !sessions.has(token)) {
    next(new Error('AUTH_REQUIRED'))
    return
  }
  socket.data.token = token
  socket.data.user = sessions.get(token)
  next()
})

io.on('connection', (socket) => {
  socketRate.set(socket.id, { joinAt: 0, moveAt: 0 })
  socket.emit('room:state', {
    protocolVersion: PROTOCOL_VERSION,
    status: 'idle',
    queueSize: queue.length,
  })

  socket.on('queue:join', (payload = {}) => {
    const limiter = socketRate.get(socket.id)
    if (!limiter) return
    const now = Date.now()
    if (now - limiter.joinAt < 1200) {
      socket.emit('match:end', {
        protocolVersion: PROTOCOL_VERSION,
        result: 'error',
        reason: 'QUEUE_RATE_LIMIT',
      })
      return
    }
    limiter.joinAt = now

    if (payload.protocolVersion !== PROTOCOL_VERSION) {
      socket.emit('match:end', {
        protocolVersion: PROTOCOL_VERSION,
        result: 'error',
        reason: 'PROTOCOL_MISMATCH',
        expectedVersion: PROTOCOL_VERSION,
      })
      return
    }
    if (payload.game !== 'xox') {
      socket.emit('match:end', {
        protocolVersion: PROTOCOL_VERSION,
        result: 'error',
        reason: 'UNSUPPORTED_GAME',
      })
      return
    }
    if (socketToRoom.has(socket.id)) return
    if (queue.includes(socket.id)) return

    queue.push(socket.id)
    socket.emit('room:state', {
      protocolVersion: PROTOCOL_VERSION,
      status: 'queueing',
      queueSize: queue.length,
    })
    tryMatchmake()

    const preferBot = payload.preferBot !== false
    if (preferBot && queue.includes(socket.id)) {
      scheduleBotMatch(socket.id)
    }
  })

  socket.on('move:submit', (payload = {}) => {
    const roomId = socketToRoom.get(socket.id)
    if (!roomId) return
    const room = rooms.get(roomId)
    if (!room || room.status !== 'active') return

    const limiter = socketRate.get(socket.id)
    if (!limiter) return
    const now = Date.now()
    if (now - limiter.moveAt < 180) {
      socket.emit('match:end', {
        protocolVersion: PROTOCOL_VERSION,
        result: 'error',
        reason: 'MOVE_RATE_LIMIT',
      })
      return
    }
    limiter.moveAt = now

    if (payload.protocolVersion !== PROTOCOL_VERSION) {
      socket.emit('match:end', {
        protocolVersion: PROTOCOL_VERSION,
        result: 'error',
        reason: 'PROTOCOL_MISMATCH',
        expectedVersion: PROTOCOL_VERSION,
      })
      return
    }
    if (!Number.isInteger(payload.index) || payload.index < 0 || payload.index > 8) return

    const me = room.players.find((player) => player.socketId === socket.id)
    if (!me || me.symbol !== room.turn) return
    if (room.board[payload.index] != null) return

    applyMove(room, me.symbol, payload.index)
    finalizeRoomIfEnded(room)
    if (room.status === 'active') {
      scheduleBotMove(room)
    }
  })

  socket.on('disconnect', () => {
    clearBotMatchTimer(socket.id)
    removeFromQueue(socket.id)
    handleDisconnectLoss(socket.id)
    socketRate.delete(socket.id)
  })
})

function tryMatchmake() {
  while (queue.length >= 2) {
    const firstId = queue.shift()
    const secondId = queue.shift()
    if (!firstId || !secondId) return

    clearBotMatchTimer(firstId)
    clearBotMatchTimer(secondId)

    const a = io.sockets.sockets.get(firstId)
    const b = io.sockets.sockets.get(secondId)
    if (!a || !b) continue

    const roomId = `xox_${makeId()}`
    const players = [
      {
        socketId: a.id,
        userId: a.data.user.userId,
        displayName: a.data.user.displayName,
        symbol: 'X',
      },
      {
        socketId: b.id,
        userId: b.data.user.userId,
        displayName: b.data.user.displayName,
        symbol: 'O',
      },
    ]

    const room = {
      id: roomId,
      protocolVersion: PROTOCOL_VERSION,
      board: Array(9).fill(null),
      turn: 'X',
      status: 'active',
      moves: 0,
      winner: null,
      players,
    }
    rooms.set(roomId, room)

    a.join(roomId)
    b.join(roomId)
    socketToRoom.set(a.id, roomId)
    socketToRoom.set(b.id, roomId)

    for (const player of players) {
      const currentSocket = io.sockets.sockets.get(player.socketId)
      if (!currentSocket) continue
      currentSocket.emit('match:found', {
        protocolVersion: PROTOCOL_VERSION,
        game: 'xox',
        roomId,
        you: {
          userId: player.userId,
          displayName: player.displayName,
          symbol: player.symbol,
        },
        opponent: {
          userId: players.find((p) => p.socketId !== player.socketId)?.userId ?? '',
          displayName: players.find((p) => p.socketId !== player.socketId)?.displayName ?? 'Rakip',
          symbol: players.find((p) => p.socketId !== player.socketId)?.symbol ?? 'O',
        },
      })
    }

    emitRoomState(room)
  }
}

function scheduleBotMatch(socketId) {
  clearBotMatchTimer(socketId)
  const timer = setTimeout(() => {
    botMatchTimers.delete(socketId)
    if (!queue.includes(socketId)) return
    removeFromQueue(socketId)
    const socket = io.sockets.sockets.get(socketId)
    if (!socket || socketToRoom.has(socketId)) return
    startBotMatch(socket)
  }, BOT_MATCH_DELAY_MS)
  botMatchTimers.set(socketId, timer)
}

function clearBotMatchTimer(socketId) {
  const timer = botMatchTimers.get(socketId)
  if (timer) clearTimeout(timer)
  botMatchTimers.delete(socketId)
}

function startBotMatch(humanSocket) {
  const roomId = `xox_${makeId()}`
  const botName = BOT_DISPLAY_NAMES[Math.floor(Math.random() * BOT_DISPLAY_NAMES.length)]
  const humanPlayer = {
    socketId: humanSocket.id,
    userId: humanSocket.data.user.userId,
    displayName: humanSocket.data.user.displayName,
    symbol: 'X',
    isBot: false,
  }
  const botPlayer = {
    socketId: `bot:${roomId}`,
    userId: `bot_${makeId()}`,
    displayName: botName,
    symbol: 'O',
    isBot: true,
  }

  const room = {
    id: roomId,
    protocolVersion: PROTOCOL_VERSION,
    board: Array(9).fill(null),
    turn: 'X',
    status: 'active',
    moves: 0,
    winner: null,
    players: [humanPlayer, botPlayer],
    isBotRoom: true,
  }
  rooms.set(roomId, room)
  humanSocket.join(roomId)
  socketToRoom.set(humanSocket.id, roomId)

  humanSocket.emit('match:found', {
    protocolVersion: PROTOCOL_VERSION,
    game: 'xox',
    roomId,
    you: {
      userId: humanPlayer.userId,
      displayName: humanPlayer.displayName,
      symbol: humanPlayer.symbol,
    },
    opponent: {
      userId: botPlayer.userId,
      displayName: botPlayer.displayName,
      symbol: botPlayer.symbol,
      isBot: true,
    },
  })

  emitRoomState(room)
}

function applyMove(room, symbol, index) {
  room.board[index] = symbol
  room.moves += 1
  const winner = getWinner(room.board)
  if (winner) {
    room.status = 'ended'
    room.winner = winner
  } else if (room.moves >= 9) {
    room.status = 'ended'
    room.winner = 'draw'
  } else {
    room.turn = room.turn === 'X' ? 'O' : 'X'
  }
}

function finalizeRoomIfEnded(room) {
  emitRoomState(room)
  if (room.status !== 'ended') return

  for (const player of room.players) {
    if (player.isBot) continue
    const playerSocket = io.sockets.sockets.get(player.socketId)
    if (!playerSocket) continue
    const result = room.winner === 'draw' ? 'draw' : room.winner === player.symbol ? 'win' : 'lose'
    playerSocket.emit('match:end', {
      protocolVersion: PROTOCOL_VERSION,
      roomId: room.id,
      result,
      reason: room.winner === 'draw' ? 'DRAW' : 'CHECKMATE',
      xpAward: result === 'win' ? XP_ON_WIN : result === 'draw' ? XP_ON_DRAW : 0,
    })
  }
  cleanupRoom(room.id)
}

function scheduleBotMove(room) {
  if (!room.isBotRoom || room.status !== 'active') return
  const bot = room.players.find((player) => player.isBot)
  if (!bot || room.turn !== bot.symbol) return

  clearBotMoveTimer(room.id)
  const delay = BOT_MOVE_MIN_MS + Math.floor(Math.random() * BOT_MOVE_JITTER_MS)
  const timer = setTimeout(() => {
    botMoveTimers.delete(room.id)
    const liveRoom = rooms.get(room.id)
    if (!liveRoom || liveRoom.status !== 'active') return
    const liveBot = liveRoom.players.find((player) => player.isBot)
    if (!liveBot || liveRoom.turn !== liveBot.symbol) return

    const human = liveRoom.players.find((player) => !player.isBot)
    const humanSymbol = human?.symbol ?? 'X'
    const index = pickBotMove(liveRoom.board, liveBot.symbol, humanSymbol)
    if (index == null || liveRoom.board[index] != null) return

    applyMove(liveRoom, liveBot.symbol, index)
    finalizeRoomIfEnded(liveRoom)
    if (liveRoom.status === 'active') {
      scheduleBotMove(liveRoom)
    }
  }, delay)
  botMoveTimers.set(room.id, timer)
}

function clearBotMoveTimer(roomId) {
  const timer = botMoveTimers.get(roomId)
  if (timer) clearTimeout(timer)
  botMoveTimers.delete(roomId)
}

function pickBotMove(board, botSymbol, humanSymbol) {
  const winning = findBestMove(board, botSymbol)
  if (winning != null) return winning
  const block = findBestMove(board, humanSymbol)
  if (block != null) return block
  if (board[4] == null) return 4
  const corners = [0, 2, 6, 8].filter((index) => board[index] == null)
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)]
  }
  const open = board.map((cell, index) => (cell == null ? index : -1)).filter((index) => index >= 0)
  return open.length > 0 ? open[Math.floor(Math.random() * open.length)] : null
}

function findBestMove(board, symbol) {
  for (let index = 0; index < 9; index += 1) {
    if (board[index] != null) continue
    const next = [...board]
    next[index] = symbol
    if (getWinner(next) === symbol) return index
  }
  return null
}

function emitRoomState(room) {
  io.to(room.id).emit('room:state', {
    protocolVersion: PROTOCOL_VERSION,
    roomId: room.id,
    status: room.status,
    board: room.board,
    turn: room.turn,
    winner: room.winner,
    moves: room.moves,
  })
}

function cleanupRoom(roomId) {
  clearBotMoveTimer(roomId)
  const room = rooms.get(roomId)
  if (!room) return
  for (const player of room.players) {
    socketToRoom.delete(player.socketId)
    const playerSocket = io.sockets.sockets.get(player.socketId)
    if (playerSocket) playerSocket.leave(roomId)
  }
  rooms.delete(roomId)
}

function removeFromQueue(socketId) {
  clearBotMatchTimer(socketId)
  const idx = queue.indexOf(socketId)
  if (idx >= 0) queue.splice(idx, 1)
}

function handleDisconnectLoss(socketId) {
  const roomId = socketToRoom.get(socketId)
  if (!roomId) return
  const room = rooms.get(roomId)
  if (!room || room.status !== 'active') return

  room.status = 'ended'
  const leaver = room.players.find((player) => player.socketId === socketId)
  const winner = room.players.find((player) => player.socketId !== socketId && !player.isBot)
  room.winner = winner?.symbol ?? 'draw'
  emitRoomState(room)

  if (winner && !winner.isBot) {
    const winnerSocket = io.sockets.sockets.get(winner.socketId)
    winnerSocket?.emit('match:end', {
      protocolVersion: PROTOCOL_VERSION,
      roomId,
      result: 'win',
      reason: 'OPPONENT_DISCONNECTED',
      xpAward: XP_ON_WIN,
    })
  }
  if (leaver) {
    const leaverSocket = io.sockets.sockets.get(leaver.socketId)
    leaverSocket?.emit('match:end', {
      protocolVersion: PROTOCOL_VERSION,
      roomId,
      result: 'lose',
      reason: 'DISCONNECTED',
      xpAward: 0,
    })
  }

  cleanupRoom(roomId)
}

function getWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

httpServer.listen(PORT, () => {
  console.log(`Game server listening on http://localhost:${PORT}`)
  console.log(`Allowed client origin: ${CLIENT_ORIGIN}`)
  console.log(`Protocol version: ${PROTOCOL_VERSION}`)
})
