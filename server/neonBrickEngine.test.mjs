import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PADDLE_Y,
  brickRect,
  createBricks,
  createSide,
  stepSide,
} from './neonBrickEngine.mjs'

test('raketin kenarına çarpan top açılı seker', () => {
  const side = createSide(1)
  side.ball = { x: side.paddleX + 0.1, y: PADDLE_Y - 0.02, vx: 0.02, vy: 0.45, active: true }
  stepSide(side, 1 / 60, 1)
  assert.ok(side.ball.vy < 0)
  assert.ok(side.ball.vx > 0)
})

test('tuğlanın içine giren top canını düşürür', () => {
  const side = createSide(1)
  const index = side.bricks.findIndex((brick) => brick.hp > 0 && !brick.steel)
  const rect = brickRect(index)
  const before = side.bricks[index].hp
  side.ball = { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, vx: 0.05, vy: 0.2, active: true }
  stepSide(side, 1 / 60, 1)
  assert.ok(side.bricks[index].hp < before)
  assert.ok(side.score >= 100 || side.bricks[index].hp > 0)
})

test('çelik tuğla kırılmaz', () => {
  const bricks = createBricks(3)
  const index = bricks.findIndex((brick) => brick.steel)
  assert.ok(index >= 0)
  const side = createSide(1)
  side.bricks = bricks
  const rect = brickRect(index)
  side.ball = { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, vx: 0.2, vy: -0.2, active: true }
  stepSide(side, 1 / 60, 1)
  stepSide(side, 1 / 60, 1)
  assert.equal(side.bricks[index].steel, true)
  assert.equal(side.bricks[index].hp, 1)
})

test('aşağı düşen top can götürür', () => {
  const side = createSide(1)
  side.ball = { x: 0.5, y: 1.08, vx: 0, vy: 0.3, active: true }
  stepSide(side, 1 / 60, 1)
  assert.equal(side.lives, 2)
  assert.equal(side.ball.active, false)
})
