import type { MathLaneState, MathProblem } from './mathDuelEngine'

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function botThinkDelayMs(combo: number): number {
  return Math.max(520, 1900 - combo * 120)
}

export function pickBotChoice(problem: MathProblem, lane: MathLaneState, seed: number): number {
  const rand = mulberry32(seed + problem.id * 13 + lane.score)
  const accuracy = Math.min(0.92, 0.52 + lane.matchPoints * 0.04 + problem.id * 0.01)
  if (rand() < accuracy) return problem.correctIndex
  const wrong = problem.choices
    .map((_, i) => i)
    .filter((i) => i !== problem.correctIndex)
  return wrong[Math.floor(rand() * wrong.length)] ?? problem.correctIndex
}
