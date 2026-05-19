export type MatchTabId = 'discover' | 'likers' | 'matches'

export type MatchGameChip = {
  id: string
  label: string
  emoji: string
  more?: boolean
}

export type MatchStyleTag = {
  id: string
  label: string
  icon: 'gamepad' | 'target' | 'trophy'
}

export const matchTabs: { id: MatchTabId; label: string; badge?: number }[] = [
  { id: 'discover', label: 'Keşfet' },
  { id: 'likers', label: 'Beğenenler' },
  { id: 'matches', label: 'Eşleşmelerim', badge: 12 },
]

export const matchProfile = {
  name: 'Zeynep',
  age: 21,
  verified: true,
  online: true,
  compatibility: 89,
  locationLine: '1.8 km uzaklıkta, İstanbul, Türkiye',
  tags: [
    { id: 'fps', label: 'FPS', icon: 'gamepad' as const },
    { id: 'ranked', label: 'Rekabetçi', icon: 'target' as const },
    { id: 'rank', label: 'Platinum I', icon: 'trophy' as const },
  ] satisfies MatchStyleTag[],
  favoriteGames: [
    { id: 'bd', label: 'Block Duel', emoji: '🧱' },
    { id: 'puz', label: 'Puzzle', emoji: '🧩' },
    { id: 'pool', label: '8 Ball', emoji: '🎱' },
    { id: 'plus', label: '+2', emoji: '✨', more: true },
  ] satisfies MatchGameChip[],
  bio: "Valorant & Block Duel oyuncusu. Gece kuşuyum — ranked'a gel! 🎮💜",
}
