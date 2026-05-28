import { throwFromAimPower } from './dartDuelEngine'

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function pickBotAimPower(seed: number, remaining: number) {
  const rand = mulberry32(seed)
  const aimBull = remaining <= 80 || rand() > 0.5
  const aimX = aimBull ? 0.5 + (rand() - 0.5) * 0.12 : 0.5 + (rand() - 0.5) * 0.35
  const power = aimBull ? 0.72 + rand() * 0.1 : 0.55 + rand() * 0.35
  return {
    aimX: Math.max(0.12, Math.min(0.88, aimX)),
    power: Math.max(0.25, Math.min(0.95, power)),
  }
}

export function botThrow(seed: number, remaining: number) {
  const rand = mulberry32(seed + 17)
  const { aimX, power } = pickBotAimPower(seed, remaining)
  return throwFromAimPower(aimX, power, rand)
}

export function botThinkDelayMs() {
  return 900 + Math.floor(Math.random() * 600)
}
