import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import test from 'node:test'

import { Server } from 'socket.io'
import { io as ioClient } from 'socket.io-client'

import { attachNeonBrick } from './neonBrickRooms.js'

test('iki oyuncu aynı odada aynı topu görür', async () => {
  const httpServer = createServer()
  const io = new Server(httpServer)
  const neon = attachNeonBrick(io, {
    protocolVersion: '1.0.0',
    makeCode: () => 'masa',
  })
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve))
  const port = httpServer.address().port
  const url = `http://127.0.0.1:${port}`

  const host = ioClient(url, { transports: ['websocket'] })
  const guest = ioClient(url, { transports: ['websocket'] })
  const hostStates = []
  const guestStates = []
  host.on('neon:state', (state) => hostStates.push(state))
  guest.on('neon:state', (state) => guestStates.push(state))

  await Promise.all([once(host, 'connect'), once(guest, 'connect')])
  host.emit('neon:create')
  await once(host, 'neon:lobby')
  guest.emit('neon:join', { code: 'masa' })
  await once(guest, 'neon:lobby')

  await new Promise((resolve) => setTimeout(resolve, 250))
  host.emit('neon:input', { paddleX: 0.15 })
  await new Promise((resolve) => setTimeout(resolve, 300))

  const left = hostStates.at(-1)
  const right = guestStates.at(-1)
  assert.ok(left)
  assert.ok(right)
  assert.equal(left.code, 'masa')
  assert.equal(left.p1.ball.x, right.p1.ball.x)
  assert.equal(left.p1.score, right.p1.score)
  assert.equal(left.p2.lives, right.p2.lives)
  assert.ok(Math.abs(left.p1.paddleX - 0.15) < 0.2)

  host.close()
  guest.close()
  neon.stop()
  await new Promise((resolve) => io.close(resolve))
  await new Promise((resolve) => httpServer.close(resolve))
})

function once(socket, event) {
  return new Promise((resolve) => socket.once(event, resolve))
}
