export function botReactionDelayMs(skill = 0.85) {
  const base = 220 + Math.random() * 280
  return Math.round(base / skill)
}

export function botFalseStartChance() {
  return Math.random() < 0.06
}
