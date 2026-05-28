import { MOLE_VISIBLE_MS } from './whackDuelEngine'

export function botWhackDelayMs(): number {
  const skill = 0.55 + Math.random() * 0.35
  return Math.floor(MOLE_VISIBLE_MS * skill)
}
