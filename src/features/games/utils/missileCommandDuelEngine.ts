export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3600
export const LEG_DURATION_MS = 45_000
export const ROUND_BREAK_MS = 2600
export const FIRE_COOLDOWN_MS = 140
export const MAX_COUNTERS = 4
export const EXPLODE_RADIUS = 13
export const EXPLODE_MS = 520
export const COUNTER_SPEED = 0.22
export const SCORE_PER_KILL = 160
export const NODE_PENALTY = 400
export const EMITTER_CHARGES_MAX = 4
export const EMITTER_RECHARGE_MS = 2000
export const COMBO_WINDOW_MS = 1400
export const COMBO_MAX = 8
export const WAVE_KILLS_STEP = 6
export const EMITTER_COUNT = 3

const NODE_X = [14, 32, 50, 68, 86]
export const EMITTER_X = [25, 50, 75]
const NODE_Y = 88
const EMITTER_Y = 94

export type McShardKind = 'standard' | 'rift' | 'splinter'

export type McNode = { id: number; x: number; y: number; alive: boolean }

export type McShard = {
  id: number
  x: number
  y: number
  targetId: number
  speed: number
  wobblePhase: number
  wobbleAmp: number
  heading: number
  trail: { x: number; y: number }[]
  kind: McShardKind
}

export type McPulse = {
  id: number
  x: number
  y: number
  tx: number
  ty: number
  originX: number
  originY: number
  originEmitter: number
  phase: 'fly' | 'burst'
  boomUntil: number
}

export type McEmitterState = {
  charges: number
  rechargeAt: number
}

export type McFxEvent =
  | { type: 'burst'; x: number; y: number }
  | { type: 'shardKill'; x: number; y: number; combo: number }
  | { type: 'nodeLost'; x: number; y: number }
  | { type: 'combo'; level: number; x: number; y: number }
  | { type: 'waveUp'; wave: number }

export type McTickResult = { side: McSideState; events: McFxEvent[] }

export type McSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  nodes: McNode[]
  shards: McShard[]
  pulses: McPulse[]
  emitters: McEmitterState[]
  lastFireAt: number
  nextSpawnAt: number
  nextShardId: number
  nextPulseId: number
  emitterFlashUntil: number
  wave: number
  waveKills: number
  combo: number
  comboUntil: number
  lastKillAt: number
}

export type MissileCommandState = {
  p1: McSideState
  p2: McSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

/** @deprecated use McNode */
export type McCity = McNode
/** @deprecated use McShard */
export type McIncoming = McShard
/** @deprecated use McPulse */
export type McCounter = McPulse

export function createEmitters(): McEmitterState[] {
  return Array.from({ length: EMITTER_COUNT }, () => ({ charges: EMITTER_CHARGES_MAX, rechargeAt: 0 }))
}

export function createNodes(): McNode[] {
  return NODE_X.map((x, i) => ({ id: i + 1, x, y: NODE_Y, alive: true }))
}

export function createCities(): McNode[] {
  return createNodes()
}

export function createSide(sideId: 1 | 2, now: number): McSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    nodes: createNodes(),
    shards: [],
    pulses: [],
    emitters: createEmitters(),
    lastFireAt: 0,
    nextSpawnAt: now + 1100,
    nextShardId: 1,
    nextPulseId: 1,
    emitterFlashUntil: 0,
    wave: 1,
    waveKills: 0,
    combo: 0,
    comboUntil: 0,
    lastKillAt: 0,
  }
}

export function createMissileCommandState(now: number): MissileCommandState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

function pickEmitterIndex(tx: number) {
  let bestIdx = 1
  let bestD = Infinity
  for (let i = 0; i < EMITTER_X.length; i++) {
    const d = Math.abs(EMITTER_X[i]! - tx)
    if (d < bestD) {
      bestD = d
      bestIdx = i
    }
  }
  return bestIdx
}

function emitterPos(idx: number) {
  return { x: EMITTER_X[idx] ?? 50, y: EMITTER_Y }
}

function resolveTarget(nodes: McNode[], targetId: number) {
  const direct = nodes.find((n) => n.id === targetId && n.alive)
  if (direct) return direct
  return nodes.find((n) => n.alive) ?? null
}

function comboMultiplier(combo: number) {
  return Math.min(2.5, 1 + (combo - 1) * 0.22)
}

function killScore(combo: number) {
  return Math.round(SCORE_PER_KILL * comboMultiplier(combo))
}

function spawnDelay(side: McSideState, rand: () => number) {
  return Math.max(360, 920 - side.wave * 75) + rand() * 380
}

function clusterSize(side: McSideState, rand: () => number) {
  if (side.wave >= 5 && rand() < 0.38) return 3
  if (side.wave >= 3 && rand() < 0.42) return 2
  return 1
}

function makeShard(
  side: McSideState,
  targetId: number,
  kind: McShardKind,
  rand: () => number,
): McShard {
  const startX = 10 + rand() * 80
  const startY = 4 + rand() * 10
  const speedBase = kind === 'splinter' ? 0.048 : kind === 'rift' ? 0.042 : 0.032
  const speedVar = kind === 'splinter' ? 0.012 : kind === 'rift' ? 0.016 : 0.018

  return {
    id: side.nextShardId,
    x: startX,
    y: startY,
    targetId,
    speed: speedBase + rand() * speedVar + side.wave * 0.002,
    wobblePhase: rand() * Math.PI * 2,
    wobbleAmp: kind === 'splinter' ? 0.04 : 0.06 + rand() * 0.05,
    heading: 0,
    trail: [{ x: startX, y: startY }],
    kind,
  }
}

function tickEmitters(emitters: McEmitterState[], now: number): McEmitterState[] {
  return emitters.map((em) => {
    if (em.charges >= EMITTER_CHARGES_MAX) return em
    if (em.rechargeAt <= 0 || now < em.rechargeAt) return em
    const charges = Math.min(EMITTER_CHARGES_MAX, em.charges + 1)
    return {
      charges,
      rechargeAt: charges < EMITTER_CHARGES_MAX ? now + EMITTER_RECHARGE_MS : 0,
    }
  })
}

function useEmitterCharge(emitters: McEmitterState[], idx: number, now: number): McEmitterState[] | null {
  const em = emitters[idx]
  if (!em || em.charges <= 0) return null
  return emitters.map((e, i) => {
    if (i !== idx) return e
    const charges = e.charges - 1
    return {
      charges,
      rechargeAt: charges < EMITTER_CHARGES_MAX && e.rechargeAt <= 0 ? now + EMITTER_RECHARGE_MS : e.rechargeAt,
    }
  })
}

export function launchCounter(side: McSideState, tx: number, ty: number, now: number): McSideState {
  return launchPulse(side, tx, ty, now)
}

export function launchPulse(side: McSideState, tx: number, ty: number, now: number): McSideState {
  const active = side.pulses.filter((p) => p.phase === 'fly' || (p.phase === 'burst' && p.boomUntil > now))
  if (active.length >= MAX_COUNTERS) return side
  if (now - side.lastFireAt < FIRE_COOLDOWN_MS) return side

  const clampedX = Math.max(6, Math.min(94, tx))
  const clampedY = Math.max(8, Math.min(88, ty))
  const emitterIdx = pickEmitterIndex(clampedX)
  const nextEmitters = useEmitterCharge(side.emitters, emitterIdx, now)
  if (!nextEmitters) return side

  const emitter = emitterPos(emitterIdx)

  const pulse: McPulse = {
    id: side.nextPulseId,
    x: emitter.x,
    y: emitter.y,
    tx: clampedX,
    ty: clampedY,
    originX: emitter.x,
    originY: emitter.y,
    originEmitter: emitterIdx,
    phase: 'fly',
    boomUntil: 0,
  }

  return {
    ...side,
    emitters: nextEmitters,
    pulses: [...side.pulses, pulse],
    nextPulseId: side.nextPulseId + 1,
    lastFireAt: now,
    emitterFlashUntil: now + 160,
  }
}

function spawnShardBurst(side: McSideState, now: number, rand: () => number): McSideState {
  const targets = side.nodes.filter((n) => n.alive)
  if (targets.length === 0) return { ...side, nextSpawnAt: now + 1200 }

  const count = clusterSize(side, rand)
  let next = { ...side, nextSpawnAt: now + spawnDelay(side, rand) }
  const picked = new Set<number>()

  for (let i = 0; i < count; i++) {
    const pool = targets.filter((t) => !picked.has(t.id))
    const target = (pool.length > 0 ? pool : targets)[Math.floor(rand() * (pool.length || targets.length))]!
    picked.add(target.id)

    let kind: McShardKind = 'standard'
    if (count >= 2 && rand() < 0.45) kind = 'rift'
    if (count >= 3 && i > 0 && rand() < 0.5) kind = 'splinter'

    const shard = makeShard(next, target.id, kind, rand)
    next = {
      ...next,
      shards: [...next.shards, shard],
      nextShardId: next.nextShardId + 1,
    }
  }

  return next
}

function activeBursts(pulses: McPulse[], now: number) {
  return pulses.filter((p) => p.phase === 'burst' && p.boomUntil > now)
}

function tickShards(shards: McShard[], nodes: McNode[], dt: number): McShard[] {
  return shards.map((s) => {
    const target = resolveTarget(nodes, s.targetId)
    if (!target) return s

    const dx = target.x - s.x
    const dy = target.y - s.y
    const d = Math.hypot(dx, dy) || 1
    const nx = dx / d
    const ny = dy / d
    const wobble = Math.sin(s.wobblePhase) * s.wobbleAmp
    const newX = s.x + nx * s.speed * dt + -ny * wobble * dt
    const newY = s.y + ny * s.speed * dt + nx * wobble * 0.35 * dt

    return {
      ...s,
      x: newX,
      y: newY,
      wobblePhase: s.wobblePhase + 0.005 * dt,
      heading: Math.atan2(ny, nx) * (180 / Math.PI),
      trail: [{ x: newX, y: newY }, ...s.trail].slice(0, 14),
    }
  })
}

function advanceCombo(side: McSideState, now: number, killX: number, killY: number, events: McFxEvent[]) {
  const inWindow = side.lastKillAt > 0 && now - side.lastKillAt <= COMBO_WINDOW_MS
  const combo = inWindow ? Math.min(COMBO_MAX, side.combo + 1) : 1
  if (combo >= 2) events.push({ type: 'combo', level: combo, x: killX, y: killY })
  return {
    combo,
    comboUntil: now + COMBO_WINDOW_MS,
    lastKillAt: now,
    scoreGain: killScore(combo),
    comboForEvent: combo,
  }
}

function bumpWave(side: McSideState, kills: number, events: McFxEvent[]) {
  let waveKills = side.waveKills + kills
  let wave = side.wave
  while (waveKills >= WAVE_KILLS_STEP) {
    waveKills -= WAVE_KILLS_STEP
    wave++
    events.push({ type: 'waveUp', wave })
  }
  return { ...side, wave, waveKills }
}

export function tickSide(side: McSideState, dt: number, now: number, rand: () => number): McTickResult {
  if (dt <= 0) return { side, events: [] }

  const events: McFxEvent[] = []
  let s: McSideState = {
    ...side,
    emitters: tickEmitters(side.emitters, now),
    combo: side.comboUntil > now ? side.combo : 0,
  }

  if (now >= s.nextSpawnAt && s.nodes.some((n) => n.alive)) {
    s = spawnShardBurst(s, now, rand)
  }

  s.shards = tickShards(s.shards, s.nodes, dt)

  const pulses: McPulse[] = []
  for (const p of s.pulses) {
    if (p.phase === 'fly') {
      const d = dist(p.x, p.y, p.tx, p.ty)
      if (d < 2.5) {
        pulses.push({ ...p, x: p.tx, y: p.ty, phase: 'burst', boomUntil: now + EXPLODE_MS })
        events.push({ type: 'burst', x: p.tx, y: p.ty })
      } else {
        const step = COUNTER_SPEED * dt
        const t = Math.min(1, step / d)
        pulses.push({
          ...p,
          x: p.x + (p.tx - p.x) * t,
          y: p.y + (p.ty - p.y) * t,
        })
      }
    } else if (p.boomUntil > now) {
      pulses.push(p)
    }
  }
  s.pulses = pulses

  const bursts = activeBursts(s.pulses, now)
  const hitShards = new Set<number>()
  for (const m of s.shards) {
    for (const b of bursts) {
      if (dist(m.x, m.y, b.x, b.y) < EXPLODE_RADIUS) {
        hitShards.add(m.id)
        break
      }
    }
  }

  if (hitShards.size > 0) {
    let score = s.score
    for (const m of s.shards) {
      if (!hitShards.has(m.id)) continue
      const cx = m.x
      const cy = m.y
      const { combo, comboUntil, lastKillAt, scoreGain, comboForEvent } = advanceCombo(s, now, cx, cy, events)
      s = { ...s, combo, comboUntil, lastKillAt }
      score += scoreGain
      events.push({ type: 'shardKill', x: cx, y: cy, combo: comboForEvent })
    }
    s.shards = s.shards.filter((m) => !hitShards.has(m.id))
    s.score = score
    s = bumpWave(s, hitShards.size, events)
  }

  let nodes = [...s.nodes]
  let score = s.score
  const survived: McShard[] = []
  for (const m of s.shards) {
    let hit = false
    for (const n of nodes) {
      if (!n.alive) continue
      if (m.y >= n.y - 3 && dist(m.x, m.y, n.x, n.y) < 7) {
        nodes = nodes.map((ni) => (ni.id === n.id ? { ...ni, alive: false } : ni))
        score = Math.max(0, score - NODE_PENALTY)
        events.push({ type: 'nodeLost', x: n.x, y: n.y })
        s = { ...s, combo: 0, comboUntil: 0, lastKillAt: 0 }
        hit = true
        break
      }
    }
    if (!hit && m.y < 102) survived.push(m)
  }
  s.shards = survived
  s.nodes = nodes
  s.score = score

  return { side: s, events }
}

export function getThreatenedNodes(side: McSideState): number[] {
  const ids = new Set<number>()
  for (const s of side.shards) {
    if (s.y < 38) continue
    const target = resolveTarget(side.nodes, s.targetId)
    if (!target) continue
    const d = dist(s.x, s.y, target.x, target.y)
    if (d / s.speed < 2800) ids.add(target.id)
  }
  return [...ids]
}

export function legShouldEnd(g: MissileCommandState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: McSideState, p2: McSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function aliveNodes(side: McSideState) {
  return side.nodes.filter((n) => n.alive).length
}

export function aliveCities(side: McSideState) {
  return aliveNodes(side)
}

export const CITY_PENALTY = NODE_PENALTY
