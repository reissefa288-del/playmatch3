export function botShootDelayMs(): number {
  return 450 + Math.random() * 550
}

export function botMarkerPosition(): number {
  const roll = Math.random()
  if (roll < 0.35) return 48 + (Math.random() - 0.5) * 12
  if (roll < 0.7) return 50 + (Math.random() - 0.5) * 36
  return 12 + Math.random() * 76
}
