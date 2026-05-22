export const PROFILE_XP_STORAGE_KEY = 'pm-profile-total-xp'

/** XP needed to complete level `level` and reach level+1 */
export function xpNeededForLevel(level: number): number {
  return 5000 + level * 95
}

export function totalXpAtLevelStart(level: number): number {
  let total = 0
  for (let l = 1; l < level; l += 1) {
    total += xpNeededForLevel(l)
  }
  return total
}

export const DEFAULT_TOTAL_XP = totalXpAtLevelStart(42) + 7280

export type LevelSnapshot = {
  level: number
  title: string
  totalXp: number
  xpInLevel: number
  xpToNext: number
  percent: number
  xpRemaining: number
  nextLevel: number
}

export function getLevelTitle(level: number): string {
  if (level >= 40) return 'Efsane'
  if (level >= 30) return 'Usta'
  if (level >= 20) return 'Elit'
  if (level >= 12) return 'Deneyimli'
  if (level >= 6) return 'Oyuncu'
  return 'Çaylak'
}

export function getLevelFromTotalXp(totalXp: number): number {
  let level = 1
  let accrued = 0
  while (level < 99) {
    const need = xpNeededForLevel(level)
    if (accrued + need > totalXp) break
    accrued += need
    level += 1
  }
  return level
}

export function getLevelSnapshot(totalXp: number): LevelSnapshot {
  const safeXp = Math.max(0, Math.floor(totalXp))
  const level = getLevelFromTotalXp(safeXp)
  const floorXp = totalXpAtLevelStart(level)
  const xpToNext = xpNeededForLevel(level)
  const xpInLevel = safeXp - floorXp
  const percent = xpToNext > 0 ? Math.min(100, (xpInLevel / xpToNext) * 100) : 0

  return {
    level,
    title: getLevelTitle(level),
    totalXp: safeXp,
    xpInLevel,
    xpToNext,
    percent,
    xpRemaining: Math.max(0, xpToNext - xpInLevel),
    nextLevel: level + 1,
  }
}

export function formatXp(value: number): string {
  return value.toLocaleString('tr-TR')
}

export function loadStoredTotalXp(): number {
  if (typeof window === 'undefined') return DEFAULT_TOTAL_XP
  try {
    const raw = localStorage.getItem(PROFILE_XP_STORAGE_KEY)
    if (raw == null) return DEFAULT_TOTAL_XP
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_TOTAL_XP
  } catch {
    return DEFAULT_TOTAL_XP
  }
}

export function saveTotalXp(totalXp: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PROFILE_XP_STORAGE_KEY, String(Math.max(0, Math.floor(totalXp))))
  } catch {
    /* ignore */
  }
}

/** XP granted when starting a game from the hub */
export const XP_GAME_FEATURED = 185
export const XP_GAME_POPULAR = 95
