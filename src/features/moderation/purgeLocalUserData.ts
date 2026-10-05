/** ADIM 11.3 — hesap silme sonrası yerel veri temizliği */

const LOCAL_KEYS = [
  'pm-premium-subscription',
  'pm-nearby-likes',
  'pm-daily-likes-quota',
  'pm-home-filters',
  'pm-gem-balance',
  'pm-profile-level',
  'pm-game-matched-invites',
] as const

export function purgeLocalUserData(): void {
  for (const key of LOCAL_KEYS) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  }

  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key?.startsWith('pm-')) keysToRemove.push(key)
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key)
    }
  } catch {
    /* ignore */
  }
}
