import {
  spawnBurstFx,
  spawnPulseFireFx,
  type RwParticle,
} from './riftWardFx'
import type { Y42FxEvent } from './game1942DuelEngine'

export type Y42ParticleKind = RwParticle['kind'] | 'ring' | 'streak'

export type Y42Particle = {
  id: number
  kind: Y42ParticleKind
  x: number
  y: number
  angle: number
  bornAt: number
  lifeMs: number
}

let nextParticleId = 200_000

function particle(
  kind: Y42ParticleKind,
  x: number,
  y: number,
  bornAt: number,
  lifeMs: number,
  angle = Math.random() * 360,
): Y42Particle {
  return { id: nextParticleId++, kind, x, y, angle, bornAt, lifeMs }
}

function mergeParticles(base: Y42Particle[], added: Y42Particle[]): Y42Particle[] {
  const merged = [...base, ...added]
  return merged.length > 80 ? merged.slice(merged.length - 80) : merged
}

function spawnEnemyKillFx(x: number, y: number, now: number): Y42Particle[] {
  const burst = spawnBurstFx(x, y, now, 1.25).map((p) => ({ ...p, kind: p.kind as Y42ParticleKind }))
  burst.push(particle('ring', x, y, now, 360, 0))
  for (let i = 0; i < 5; i++) {
    burst.push(particle('streak', x, y, now, 220 + Math.random() * 90, Math.random() * 360))
  }
  return burst
}

function spawnShipHitFx(x: number, y: number, now: number): Y42Particle[] {
  const out: Y42Particle[] = [
    particle('shock', x, y, now, 500),
    particle('flash', x, y, now, 300),
    particle('ring', x, y, now, 440),
  ]
  for (let i = 0; i < 10; i++) {
    out.push(particle('ember', x, y, now, 400 + Math.random() * 220, (360 / 10) * i))
  }
  for (let i = 0; i < 5; i++) {
    out.push(particle('spark', x, y, now, 260 + Math.random() * 120, Math.random() * 360))
  }
  return out
}

function spawnMuzzleFx(x: number, y: number, now: number): Y42Particle[] {
  const out = spawnPulseFireFx(x, y, now).map((p) => ({ ...p, kind: p.kind as Y42ParticleKind }))
  out.push(particle('streak', x, y, now, 150, -90))
  return out
}

export function applyY42FxEvents(
  events: Y42FxEvent[],
  now: number,
  particles: Y42Particle[],
  shakeUntil: number,
  isPlayerSide: boolean,
): { particles: Y42Particle[]; shakeUntil: number } {
  let nextParticles = particles
  let nextShake = shakeUntil

  for (const e of events) {
    switch (e.type) {
      case 'enemyKill':
        nextParticles = mergeParticles(nextParticles, spawnEnemyKillFx(e.x, e.y, now))
        break
      case 'shipHit':
        nextParticles = mergeParticles(nextParticles, spawnShipHitFx(e.x, e.y, now))
        if (isPlayerSide) nextShake = Math.max(nextShake, now + 380)
        break
      default:
        break
    }
  }

  return { particles: nextParticles, shakeUntil: nextShake }
}

export function applyY42MuzzleFx(
  x: number,
  y: number,
  now: number,
  particles: Y42Particle[],
): { particles: Y42Particle[]; muzzleFlashUntil: number } {
  return {
    particles: mergeParticles(particles, spawnMuzzleFx(x, y, now)),
    muzzleFlashUntil: now + 120,
  }
}

export function pruneY42Particles(list: Y42Particle[], now: number): Y42Particle[] {
  return list.filter((p) => now - p.bornAt < p.lifeMs).slice(-80)
}
