import { FiGrid, FiUsers, FiZap } from 'react-icons/fi'
import { IoExtensionPuzzleOutline, IoGameControllerOutline, IoRocketOutline } from 'react-icons/io5'
import { LuSwords } from 'react-icons/lu'
import type { IconType } from 'react-icons'

export type GamesCategory = {
  id: string
  label: string
  active?: boolean
}

export type HubGame = {
  id: string
  title: string
  players: string
  playersShort: string
  activity: string
  badge: string
  icon: IconType
  accent: 'pink' | 'blue'
  artPosition: string
  mode?: string
  friends?: string[]
  cta?: string
  friendsPlaying?: string
}

export type FeaturedGame = HubGame & {
  mode: string
  friends: string[]
  cta: string
}

export type QuickPlayOption = {
  id: string
  title: string
  subtitle: string
  icon: IconType
  accent: 'pink' | 'blue'
  cta: string
  online: string
}


export const gamesCategories: GamesCategory[] = [
  { id: 'all', label: 'Tümü', active: true },
  { id: 'ranked', label: 'Rekabetçi' },
  { id: 'duo', label: '2 Oyunculu' },
  { id: 'strategy', label: 'Strateji' },
  { id: 'random', label: 'Rastgele' },
]

export const gamesLiveHub = {
  activeLabel: '3.842 oyuncu çevrimiçi',
  friendsLabel: '4 arkadaşın lobide',
}

export const featuredGames: FeaturedGame[] = [
  {
    id: 'block-duel',
    title: 'BLOCK DUEL',
    mode: 'Ranked · 2v2',
    players: '2.3K oyuncu',
    playersShort: '2.3K',
    activity: 'Canlı lobi',
    badge: 'CANLI',
    icon: FiGrid,
    accent: 'pink',
    artPosition: '12% 42%',
    friends: ['E', 'M', 'K'],
    friendsPlaying: '4 arkadaş oynuyor',
    cta: 'Şimdi Oyna',
  },
  {
    id: 'xox-featured',
    title: 'XOX',
    mode: 'Hızlı maç',
    players: '1.1K oyuncu',
    playersShort: '1.1K',
    activity: 'Hızlı eşleşme',
    badge: 'POPÜLER',
    icon: IoGameControllerOutline,
    accent: 'blue',
    artPosition: '48% 44%',
    friends: ['A', 'D', 'Z'],
    cta: 'Şimdi Oyna',
  },
  {
    id: 'eruption',
    title: 'ERUPTION',
    mode: 'Element Savaşı',
    players: '1.8K oyuncu',
    playersShort: '1.8K',
    activity: 'Yeni sezon',
    badge: 'YENİ',
    icon: IoExtensionPuzzleOutline,
    accent: 'pink',
    artPosition: '72% 42%',
    friends: ['S', 'L'],
    cta: 'Şimdi Oyna',
  },
]

export const gamesGrid: HubGame[] = [
  {
    id: 'block-duel',
    title: 'Block Duel',
    players: '3.8k aktif',
    playersShort: '3.8k',
    activity: 'Lobi dolu',
    badge: 'PvP',
    icon: FiGrid,
    accent: 'pink',
    artPosition: '8% 42%',
  },
  {
    id: 'xox',
    title: 'XOX',
    players: '1.3k aktif',
    playersShort: '1.3k',
    activity: 'Hızlı maç',
    badge: '2 Oyuncu',
    icon: IoGameControllerOutline,
    accent: 'blue',
    artPosition: '22% 42%',
  },
  {
    id: 'peng-arena',
    title: 'Peng Arena',
    players: '2.1k aktif',
    playersShort: '2.1k',
    activity: 'Turnuva',
    badge: 'Yeni',
    icon: IoRocketOutline,
    accent: 'pink',
    artPosition: '36% 42%',
  },
  {
    id: 'kelime-savasi',
    title: 'Kelime Savaşı',
    players: '950 aktif',
    playersShort: '950',
    activity: 'Sesli oda',
    badge: 'Sosyal',
    icon: IoExtensionPuzzleOutline,
    accent: 'blue',
    artPosition: '50% 42%',
  },
  {
    id: 'mini-satranc',
    title: 'Mini Satranç',
    players: '1.7k aktif',
    playersShort: '1.7k',
    activity: 'Ranked',
    badge: 'Strateji',
    icon: LuSwords,
    accent: 'blue',
    artPosition: '64% 42%',
  },
  {
    id: 'hafiza-arena',
    title: 'Hafıza Arena',
    players: '720 aktif',
    playersShort: '720',
    activity: 'Yeni sezon',
    badge: 'Arcade',
    icon: FiZap,
    accent: 'pink',
    artPosition: '78% 42%',
  },
  {
    id: '8-top-duo',
    title: '8 Top Duo',
    players: '2.6k aktif',
    playersShort: '2.6k',
    activity: 'Duo',
    badge: '2 Oyuncu',
    icon: IoGameControllerOutline,
    accent: 'blue',
    artPosition: '8% 58%',
  },
  {
    id: 'sayi-avcisi',
    title: 'Sayı Avcısı',
    players: '610 aktif',
    playersShort: '610',
    activity: 'Hız modu',
    badge: 'Yeni',
    icon: FiGrid,
    accent: 'pink',
    artPosition: '22% 58%',
  },
  {
    id: 'kart-savasi',
    title: 'Kart Savaşı',
    players: '1.2k aktif',
    playersShort: '1.2k',
    activity: 'Takım',
    badge: 'Parti',
    icon: IoExtensionPuzzleOutline,
    accent: 'blue',
    artPosition: '36% 58%',
  },
  {
    id: 'rank-yarisi',
    title: 'Rank Yarışı',
    players: '880 aktif',
    playersShort: '880',
    activity: 'Sezon',
    badge: 'PvP',
    icon: FiUsers,
    accent: 'pink',
    artPosition: '50% 58%',
  },
]

export type GamesHeroStat = {
  id: string
  icon: IconType
  label: string
}

export type GamesMiniCard = {
  id: string
  title: string
  icon: IconType
  artKind:
    | 'brick-break'
    | 'block-duel'
    | 'pong'
    | 'word-arena'
    | 'xox'
    | 'snake'
    | 'color-match'
    | 'memory'
    | 'arena2048'
    | 'dart'
    | 'math'
    | 'more'
  badge?: string
  players: string
  color: 'is-pink' | 'is-blue' | 'is-green' | 'is-orange' | 'is-violet'
  isMore?: boolean
}

export const gamesHeroStats: GamesHeroStat[] = [
  { id: 'online', icon: IoGameControllerOutline, label: '3.842 oyuncu çevrimiçi' },
  { id: 'active', icon: FiZap, label: '42 aktif maç' },
]

export const popularGamesCards: GamesMiniCard[] = [
  {
    id: 'brick-break-duel',
    title: 'BRICK BREAK',
    icon: FiGrid,
    artKind: 'brick-break',
    badge: 'Duel',
    players: '1120',
    color: 'is-blue',
  },
  {
    id: 'block-duel',
    title: 'BLOCK DUEL',
    icon: FiGrid,
    artKind: 'block-duel',
    badge: 'Duel',
    players: '1245',
    color: 'is-blue',
  },
  {
    id: 'pong',
    title: 'PONG',
    icon: IoGameControllerOutline,
    artKind: 'pong',
    badge: 'Spor',
    players: '982',
    color: 'is-violet',
  },
  {
    id: 'word-arena',
    title: 'WORD ARENA',
    icon: IoExtensionPuzzleOutline,
    artKind: 'word-arena',
    badge: 'Kelime',
    players: '756',
    color: 'is-orange',
  },
  { id: 'xox', title: 'XO', icon: LuSwords, artKind: 'xox', badge: 'Klasik', players: '654', color: 'is-pink' },
  {
    id: 'snake-battle',
    title: 'SNAKE BATTLE',
    icon: IoRocketOutline,
    artKind: 'snake',
    badge: 'Aksiyon',
    players: '512',
    color: 'is-green',
  },
]

export const allGamesCards: GamesMiniCard[] = [
  { id: 'color-match', title: 'COLOR MATCH', icon: FiGrid, artKind: 'color-match', players: '432', color: 'is-violet' },
  { id: 'memory-duel', title: 'MEMORY DUEL', icon: IoExtensionPuzzleOutline, artKind: 'memory', players: '398', color: 'is-blue' },
  { id: '2048-arena', title: '2048 ARENA', icon: FiZap, artKind: 'arena2048', players: '365', color: 'is-orange' },
  { id: 'dart-duel', title: 'DART DUEL', icon: LuSwords, artKind: 'dart', players: '287', color: 'is-orange' },
  { id: 'math-clash', title: 'MATH CLASH', icon: FiUsers, artKind: 'math', players: '256', color: 'is-green' },
  {
    id: 'more-games',
    title: 'DAHA FAZLASI',
    icon: IoGameControllerOutline,
    artKind: 'more',
    players: ' ',
    color: 'is-violet',
    isMore: true,
  },
]
