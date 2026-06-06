export type RwScoreFloat = {
  id: number
  side: 'p1' | 'p2'
  amount: number
  bornAt: number
}

let nextScoreFloatId = 1

export function createScoreFloat(side: 'p1' | 'p2', amount: number, now: number): RwScoreFloat {
  return { id: nextScoreFloatId++, side, amount, bornAt: now }
}

export function pruneScoreFloats(list: RwScoreFloat[], now: number, maxAgeMs = 900): RwScoreFloat[] {
  return list.filter((f) => now - f.bornAt < maxAgeMs).slice(-8)
}

export type RwParticleKind = 'spark' | 'ember' | 'shock' | 'flash'

export type RwParticle = {
  id: number
  kind: RwParticleKind
  x: number
  y: number
  angle: number
  bornAt: number
  lifeMs: number
}

let nextParticleId = 1

function particle(
  kind: RwParticleKind,
  x: number,
  y: number,
  bornAt: number,
  lifeMs: number,
  angle = Math.random() * 360,
): RwParticle {
  return { id: nextParticleId++, kind, x, y, angle, bornAt, lifeMs }
}

export function spawnBurstFx(x: number, y: number, now: number, intensity = 1): RwParticle[] {
  const count = Math.round(6 + intensity * 4)
  const out: RwParticle[] = [particle('shock', x, y, now, 420)]
  for (let i = 0; i < count; i++) {
    out.push(particle('spark', x, y, now, 320 + Math.random() * 180, (360 / count) * i + Math.random() * 24))
  }
  for (let i = 0; i < 3; i++) {
    out.push(particle('flash', x, y, now, 260, Math.random() * 360))
  }
  return out
}

export function spawnShardKillFx(x: number, y: number, now: number): RwParticle[] {
  const out: RwParticle[] = []
  for (let i = 0; i < 5; i++) {
    out.push(particle('spark', x, y, now, 280 + Math.random() * 120, Math.random() * 360))
  }
  return out
}

export function spawnNodeLostFx(x: number, y: number, now: number): RwParticle[] {
  const out: RwParticle[] = [
    particle('shock', x, y, now, 560),
    particle('flash', x, y, now, 380),
  ]
  for (let i = 0; i < 10; i++) {
    out.push(particle('ember', x, y, now, 480 + Math.random() * 320, Math.random() * 360))
  }
  for (let i = 0; i < 8; i++) {
    out.push(particle('spark', x, y, now, 360 + Math.random() * 200, (360 / 8) * i))
  }
  return out
}

export function spawnPulseFireFx(x: number, y: number, now: number): RwParticle[] {
  return [
    particle('flash', x, y, now, 140),
    particle('spark', x, y, now, 200, Math.random() * 360),
    particle('spark', x, y, now, 180, Math.random() * 360),
  ]
}

export function pruneParticles(list: RwParticle[], now: number): RwParticle[] {
  return list.filter((p) => now - p.bornAt < p.lifeMs)
}

export function mergeParticles(...groups: RwParticle[][]): RwParticle[] {
  const cap = 80
  const merged = groups.flat()
  return merged.length > cap ? merged.slice(merged.length - cap) : merged
}
