export type NeonLeaderEntry = {
  rank: number
  name: string
  score: number
  isYou?: boolean
}

const STORAGE_KEY = 'playmeet-neon-crush-best'

const SEED_BOARD: Omit<NeonLeaderEntry, 'rank' | 'isYou'>[] = [
  { name: 'KEREM', score: 18420 },
  { name: 'AYŞE', score: 16250 },
  { name: 'MERT', score: 14880 },
  { name: 'ZEYNEP', score: 13100 },
  { name: 'CAN', score: 11940 },
  { name: 'ELİF', score: 10720 },
]

function readBest(): number {
  if (typeof window === 'undefined') return 0
  const raw = window.localStorage.getItem(STORAGE_KEY)
  const n = raw ? Number.parseInt(raw, 10) : 0
  return Number.isFinite(n) ? n : 0
}

function writeBest(score: number) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, String(score))
}

export function recordNeonCrushScore(score: number, playerName = 'EMİR'): NeonLeaderEntry[] {
  const best = Math.max(readBest(), score)
  writeBest(best)

  const merged = [
    ...SEED_BOARD,
    { name: playerName, score: best, isYou: true as const },
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  return merged.map((row, i) => ({
    rank: i + 1,
    name: row.name,
    score: row.score,
    isYou: 'isYou' in row ? row.isYou : undefined,
  }))
}

export function getNeonLeaderboard(playerName = 'EMİR'): NeonLeaderEntry[] {
  const best = readBest()
  if (best <= 0) {
    return SEED_BOARD.slice(0, 5).map((row, i) => ({
      rank: i + 1,
      name: row.name,
      score: row.score,
    }))
  }
  return recordNeonCrushScore(best, playerName)
}
