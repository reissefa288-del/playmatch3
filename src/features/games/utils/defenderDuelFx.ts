import {
  spawnBurstFx,
  spawnPulseFireFx,
  type RwParticle,
} from './riftWardFx'
import type { DefFxEvent } from './defenderDuelEngine'

export type DefParticleKind = RwParticle['kind'] | 'ring' | 'streak'

export type DefParticle = {
  id: number
  kind: DefParticleKind
  x: number
  y: number
  angle: number
  bornAt: number
  lifeMs: number
}

let nextParticleId = 100_000

function particle(
  kind: DefParticleKind,
  x: number,
  y: number,
  bornAt: number,
  lifeMs: number,
  angle = Math.random() * 360,
): DefParticle {
  return { id: nextParticleId++, kind, x, y, angle, bornAt, lifeMs }
}

function spawnEnemyKillFx(x: number, y: number, now: number): DefParticle[] {
  const burst = spawnBurstFx(x, y, now, 1.35).map((p) => ({ ...p, kind: p.kind as DefParticleKind }))
  burst.push(particle('ring', x, y, now, 380, 0))
  for (let i = 0; i < 4; i++) {
    burst.push(particle('streak', x, y, now, 240 + Math.random() * 80, Math.random() * 360))
  }
  return burst
}

function spawnShipHitFx(x: number, y: number, now: number): DefParticle[] {
  const out: DefParticle[] = [
    particle('shock', x, y, now, 520),
    particle('flash', x, y, now, 320),
    particle('ring', x, y, now, 460),
  ]
  for (let i = 0; i < 12; i++) {
    out.push(particle('ember', x, y, now, 420 + Math.random() * 240, (360 / 12) * i))
  }
  for (let i = 0; i < 6; i++) {
    out.push(particle('spark', x, y, now, 280 + Math.random() * 120, Math.random() * 360))
  }
  return out
}

function spawnHumanLostFx(x: number, y: number, now: number): DefParticle[] {
  const out: DefParticle[] = [particle('flash', x, y, now, 360), particle('ring', x, y, now, 420)]
  for (let i = 0; i < 8; i++) {
    out.push(particle('ember', x, y, now, 520 + Math.random() * 200, Math.random() * 360))
  }
  return out
}

function spawnMuzzleFx(x: number, y: number, now: number): DefParticle[] {
  const out = spawnPulseFireFx(x, y, now).map((p) => ({ ...p, kind: p.kind as DefParticleKind }))
  out.push(particle('streak', x, y, now, 160, 0))
  return out
}

function mergeDefParticles(base: DefParticle[], added: DefParticle[]): DefParticle[] {
  const merged = [...base, ...added]
  return merged.length > 80 ? merged.slice(merged.length - 80) : merged
}

export function applyDefFxEvents(
  events: DefFxEvent[],
  now: number,
  particles: DefParticle[],
  shakeUntil: number,
  isPlayerSide: boolean,
): { particles: DefParticle[]; shakeUntil: number } {
  let nextParticles = particles
  let nextShake = shakeUntil

  for (const e of events) {
    switch (e.type) {
      case 'enemyKill':
        nextParticles = mergeDefParticles(nextParticles, spawnEnemyKillFx(e.x, e.y, now))
        break
      case 'shipHit':
        nextParticles = mergeDefParticles(nextParticles, spawnShipHitFx(e.x, e.y, now))
        if (isPlayerSide) nextShake = Math.max(nextShake, now + 380)
        break
      case 'humanLost':
        nextParticles = mergeDefParticles(nextParticles, spawnHumanLostFx(e.x, e.y, now))
        break
      default:
        break
    }
  }

  return { particles: nextParticles, shakeUntil: nextShake }
}

export function applyMuzzleFx(
  x: number,
  y: number,
  now: number,
  particles: DefParticle[],
): { particles: DefParticle[]; muzzleFlashUntil: number } {
  return {
    particles: mergeDefParticles(particles, spawnMuzzleFx(x, y, now)),
    muzzleFlashUntil: now + 120,
  }
}

export function pruneDefParticles(list: DefParticle[], now: number): DefParticle[] {
  return list.filter((p) => now - p.bornAt < p.lifeMs).slice(-80)
}
