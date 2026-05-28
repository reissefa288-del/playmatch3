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
    id: 'bubble-shooter-duel',
    title: 'BUBBLE SHOOTER',
    mode: 'Duel · 1v1',
    players: '1.9K oyuncu',
    playersShort: '1.9K',
    activity: 'Canlı lobi',
    badge: 'YENİ',
    icon: IoGameControllerOutline,
    accent: 'blue',
    artPosition: '12% 42%',
    friends: ['E', 'Z', 'K'],
    friendsPlaying: '3 arkadaş oynuyor',
    cta: 'Şimdi Oyna',
  },
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
    | 'bubble-shooter'
    | 'brick-break'
    | 'block-duel'
    | 'pong'
    | 'pong-duel'
    | 'reflex-duel'
    | 'simon-duel'
    | 'whack-duel'
    | 'rhythm-duel'
    | 'catch-duel'
    | 'slice-duel'
    | 'basket-duel'
    | 'chess-duel'
    | 'galaga-duel'
    | 'word-arena'
    | 'xox'
    | 'snake'
    | 'memory'
    | 'stack'
    | 'color-match'
    | 'neon-crush'
    | 'dart'
    | 'snake-duel'
    | 'math'
    | 'math-duel'
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
    id: 'bubble-shooter-duel',
    title: 'BUBBLE SHOOTER',
    icon: IoGameControllerOutline,
    artKind: 'bubble-shooter',
    badge: 'Duel',
    players: '1340',
    color: 'is-violet',
  },
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
  { id: 'xox', title: 'XO', icon: LuSwords, artKind: 'xox', badge: 'Klasik', players: '654', color: 'is-pink' },
  {
    id: 'memory-duel',
    title: 'MEMORY DUEL',
    icon: FiZap,
    artKind: 'memory',
    badge: 'Duel',
    players: '890',
    color: 'is-violet',
  },
  {
    id: 'stack-duel',
    title: 'STACK DUEL',
    icon: FiGrid,
    artKind: 'stack',
    badge: 'Duel',
    players: '1040',
    color: 'is-blue',
  },
  {
    id: 'math-duel',
    title: 'MATH DUEL',
    icon: FiUsers,
    artKind: 'math-duel',
    badge: 'Duel',
    players: '920',
    color: 'is-green',
  },
  {
    id: 'color-match-duel',
    title: 'COLOR MATCH',
    icon: FiGrid,
    artKind: 'color-match',
    badge: 'Duel',
    players: '680',
    color: 'is-violet',
  },
  {
    id: 'neon-crush-duel',
    title: 'NEON CRUSH',
    icon: IoRocketOutline,
    artKind: 'neon-crush',
    badge: 'YENİ',
    players: '740',
    color: 'is-pink',
  },
  {
    id: 'dart-duel',
    title: 'DART DUEL',
    icon: LuSwords,
    artKind: 'dart',
    badge: 'Duel',
    players: '520',
    color: 'is-orange',
  },
  {
    id: 'snake-duel',
    title: 'SNAKE DUEL',
    icon: IoRocketOutline,
    artKind: 'snake-duel',
    badge: 'YENİ',
    players: '890',
    color: 'is-green',
  },
  {
    id: 'pong-duel',
    title: 'PONG DUEL',
    icon: IoGameControllerOutline,
    artKind: 'pong-duel',
    badge: 'Duel',
    players: '760',
    color: 'is-blue',
  },
  {
    id: 'reflex-duel',
    title: 'REFLEX DUEL',
    icon: FiZap,
    artKind: 'reflex-duel',
    badge: 'YENİ',
    players: '640',
    color: 'is-orange',
  },
  {
    id: 'simon-duel',
    title: 'SIMON DUEL',
    icon: IoExtensionPuzzleOutline,
    artKind: 'simon-duel',
    badge: 'YENİ',
    players: '580',
    color: 'is-violet',
  },
  {
    id: 'whack-duel',
    title: 'WHACK DUEL',
    icon: FiGrid,
    artKind: 'whack-duel',
    badge: 'YENİ',
    players: '510',
    color: 'is-green',
  },
  {
    id: 'rhythm-duel',
    title: 'RHYTHM DUEL',
    icon: FiZap,
    artKind: 'rhythm-duel',
    badge: 'YENİ',
    players: '620',
    color: 'is-pink',
  },
  {
    id: 'catch-duel',
    title: 'CATCH DUEL',
    icon: IoRocketOutline,
    artKind: 'catch-duel',
    badge: 'YENİ',
    players: '540',
    color: 'is-green',
  },
  {
    id: 'slice-duel',
    title: 'SLICE DUEL',
    icon: LuSwords,
    artKind: 'slice-duel',
    badge: 'YENİ',
    players: '460',
    color: 'is-orange',
  },
  {
    id: 'basket-duel',
    title: 'BASKET DUEL',
    icon: IoGameControllerOutline,
    artKind: 'basket-duel',
    badge: 'YENİ',
    players: '720',
    color: 'is-orange',
  },
  {
    id: 'chess-duel',
    title: 'SATRANÇ DUEL',
    icon: LuSwords,
    artKind: 'chess-duel',
    badge: 'YENİ',
    players: '680',
    color: 'is-violet',
  },
  {
    id: 'galaga-duel',
    title: 'GALAGA DUEL',
    icon: IoRocketOutline,
    artKind: 'galaga-duel',
    badge: 'YENİ',
    players: '590',
    color: 'is-violet',
  },
]

export const allGamesCards: GamesMiniCard[] = [
  { id: 'math-duel', title: 'MATH DUEL', icon: FiUsers, artKind: 'math-duel', players: '920', color: 'is-green' },
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
