import {
  MATCH_SECONDS,
  createSide,
  packSide,
  refillSide,
  speedForWave,
  stepSide,
} from './neonBrickEngine.mjs'

const rooms = new Map()
const socketRoom = new Map()

export function attachNeonBrick(io, options) {
  const protocolVersion = options.protocolVersion
  const makeCode = options.makeCode

  const timer = setInterval(() => {
    for (const room of rooms.values()) {
      if (room.status !== 'active') continue
      stepRoom(room, 1 / 60)
      room.emitIn += 1 / 60
      if (room.forceEmit || room.emitIn >= 0.05) {
        room.forceEmit = false
        room.emitIn = 0
        emitState(io, room, protocolVersion)
      }
    }
  }, 1000 / 60)
  timer.unref?.()

  io.on('connection', (socket) => {
    socket.on('neon:create', () => {
      if (socketRoom.has(socket.id)) return
      const code = uniqueCode(makeCode)
      const user = userOf(socket)
      const room = createRoom(code, user, socket.id)
      rooms.set(code, room)
      socket.join(code)
      socketRoom.set(socket.id, code)
      socket.emit('neon:lobby', lobbyPayload(room, 'p1', protocolVersion))
    })

    socket.on('neon:join', (payload = {}) => {
      if (socketRoom.has(socket.id)) return
      const code = String(payload.code ?? '')
        .trim()
        .toLowerCase()
      const room = rooms.get(code)
      if (!room || room.status === 'ended') {
        socket.emit('neon:error', { message: 'Oda bulunamadı.' })
        return
      }
      if (room.players.length >= 2) {
        socket.emit('neon:error', { message: 'Oda dolu.' })
        return
      }
      const user = userOf(socket)
      room.players.push({ socketId: socket.id, userId: user.userId, name: user.displayName, side: 'p2' })
      room.status = 'active'
      room.startedAt = Date.now()
      socket.join(code)
      socketRoom.set(socket.id, code)
      for (const player of room.players) {
        const current = io.sockets.sockets.get(player.socketId)
        current?.emit('neon:lobby', lobbyPayload(room, player.side, protocolVersion))
      }
      emitState(io, room, protocolVersion)
    })

    socket.on('neon:input', (payload = {}) => {
      const room = roomOf(socket.id)
      if (!room || room.status !== 'active') return
      const player = room.players.find((item) => item.socketId === socket.id)
      if (!player) return
      const paddleX = Number(payload.paddleX)
      if (!Number.isFinite(paddleX)) return
      room.sides[player.side].targetX = paddleX
    })

    socket.on('disconnect', () => {
      const code = socketRoom.get(socket.id)
      socketRoom.delete(socket.id)
      if (!code) return
      const room = rooms.get(code)
      if (!room || room.status === 'ended') return
      const leaver = room.players.find((player) => player.socketId === socket.id)
      const other = room.players.find((player) => player.socketId !== socket.id)
      room.status = 'ended'
      room.winner = other ? other.side : 'draw'
      room.reason = 'OPPONENT_DISCONNECTED'
      emitState(io, room, protocolVersion)
      if (other) {
        io.sockets.sockets.get(other.socketId)?.emit('neon:end', {
          winner: other.side,
          reason: 'OPPONENT_DISCONNECTED',
        })
      }
      if (leaver) socket.emit('neon:end', { winner: other?.side ?? 'draw', reason: 'DISCONNECTED' })
      rooms.delete(code)
    })
  })

  return {
    stop() {
      clearInterval(timer)
    },
  }
}

function createRoom(code, user, socketId) {
  return {
    code,
    status: 'waiting',
    winner: null,
    reason: '',
    timeLeft: MATCH_SECONDS,
    clock: 0,
    emitIn: 0,
    forceEmit: false,
    events: [],
    players: [{ socketId, userId: user.userId, name: user.displayName, side: 'p1' }],
    sides: { p1: createSide(1), p2: createSide(2) },
  }
}

function stepRoom(room, dt) {
  room.clock += dt
  if (room.clock >= 1) {
    room.clock -= 1
    room.timeLeft = Math.max(0, room.timeLeft - 1)
    if (room.timeLeft <= 0) {
      finish(room, winnerByScore(room), 'TIME')
      return
    }
  }

  for (const side of ['p1', 'p2']) {
    const lane = room.sides[side]
    const speed = speedForWave(lane.wave)
    const result = stepSide(lane, dt, speed)
    for (const event of result.events) room.events.push({ ...event, side })
    if (lane.lives <= 0) {
      finish(room, side === 'p1' ? 'p2' : 'p1', 'LIVES')
      return
    }
    if (result.cleared) {
      const nextWave = lane.wave + 1
      refillSide(lane, nextWave)
      room.events.push({ type: 'wave', side, wave: nextWave })
    }
  }
}

function finish(room, winner, reason) {
  room.status = 'ended'
  room.winner = winner
  room.reason = reason
  room.forceEmit = true
}

function winnerByScore(room) {
  if (room.sides.p1.score === room.sides.p2.score) return 'draw'
  return room.sides.p1.score > room.sides.p2.score ? 'p1' : 'p2'
}

function emitState(io, room, protocolVersion) {
  io.to(room.code).emit('neon:state', {
    protocolVersion,
    code: room.code,
    status: room.status,
    winner: room.winner,
    reason: room.reason,
    timeLeft: room.timeLeft,
    p1: packSide(room.sides.p1),
    p2: packSide(room.sides.p2),
    events: room.events.splice(0, room.events.length),
  })
}

function lobbyPayload(room, side, protocolVersion) {
  const self = room.players.find((player) => player.side === side)
  const other = room.players.find((player) => player.side !== side)
  return {
    protocolVersion,
    code: room.code,
    side,
    status: room.status,
    you: self?.name ?? 'Oyuncu',
    opponent: other?.name ?? '',
  }
}

function roomOf(socketId) {
  const code = socketRoom.get(socketId)
  return code ? rooms.get(code) : null
}

function userOf(socket) {
  return socket.data?.user ?? { userId: socket.id, displayName: 'Oyuncu' }
}

function uniqueCode(makeCode) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = String(makeCode()).toLowerCase()
    if (!rooms.has(code)) return code
  }
  return `${Date.now().toString(36)}`.slice(-4)
}
