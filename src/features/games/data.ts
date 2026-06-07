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
    players: '1.340 oyuncu',
    playersShort: '1.3K',
    activity: '12.8K maç bu hafta',
    badge: '#1',
    icon: IoGameControllerOutline,
    accent: 'blue',
    artPosition: '12% 42%',
    friends: ['E', 'Z', 'K'],
    friendsPlaying: '3 arkadaş oynuyor',
    cta: 'Şimdi Oyna',
  },
  {
    id: 'block-duel',
    title: 'CUBE DUEL',
    mode: 'Küp puzzle düellosu',
    players: '1.245 oyuncu',
    playersShort: '1.2K',
    activity: '11.2K maç bu hafta',
    badge: '#2',
    icon: FiGrid,
    accent: 'pink',
    artPosition: '12% 42%',
    friends: ['E', 'M', 'K'],
    friendsPlaying: '4 arkadaş oynuyor',
    cta: 'Şimdi Oyna',
  },
  {
    id: 'brick-break-duel',
    title: 'BRICK BREAK',
    mode: 'Arcade düello',
    players: '1.120 oyuncu',
    playersShort: '1.1K',
    activity: '9.6K maç bu hafta',
    badge: '#3',
    icon: FiGrid,
    accent: 'blue',
    artPosition: '48% 44%',
    friends: ['A', 'D', 'Z'],
    friendsPlaying: '2 arkadaş oynuyor',
    cta: 'Şimdi Oyna',
  },
  {
    id: 'stack-duel',
    title: 'STACK DUEL',
    mode: 'Refleks · 1v1',
    players: '1.040 oyuncu',
    playersShort: '1.0K',
    activity: '8.4K maç bu hafta',
    badge: '#4',
    icon: FiGrid,
    accent: 'pink',
    artPosition: '36% 42%',
    friends: ['M', 'S', 'L'],
    friendsPlaying: '5 arkadaş oynuyor',
    cta: 'Şimdi Oyna',
  },
  {
    id: 'math-duel',
    title: 'MATH DUEL',
    mode: 'Hız · 1v1',
    players: '920 oyuncu',
    playersShort: '920',
    activity: '7.1K maç bu hafta',
    badge: '#5',
    icon: FiUsers,
    accent: 'blue',
    artPosition: '22% 42%',
    friends: ['B', 'C', 'F'],
    friendsPlaying: '3 arkadaş oynuyor',
    cta: 'Şimdi Oyna',
  },
  {
    id: 'snake-duel',
    title: 'SNAKE DUEL',
    mode: 'Klasik · 1v1',
    players: '890 oyuncu',
    playersShort: '890',
    activity: '6.8K maç bu hafta',
    badge: '#6',
    icon: IoRocketOutline,
    accent: 'pink',
    artPosition: '64% 42%',
    friends: ['N', 'P', 'R'],
    friendsPlaying: '4 arkadaş oynuyor',
    cta: 'Şimdi Oyna',
  },
]

export const gamesGrid: HubGame[] = [
  {
    id: 'block-duel',
    title: 'Cube Duel',
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
    | 'simon-duel'
    | 'slice-duel'
    | 'chess-duel'
    | 'space-duel'
    | 'missile-command-duel'
    | 'defender-duel'
    | '1942-duel'
    | 'word-arena'
    | 'xox'
    | 'snake'
    | 'memory'
    | 'stack'
    | 'color-match'
    | 'neon-crush'
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
    title: 'CUBE DUEL',
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
    id: 'simon-duel',
    title: 'SIMON DUEL',
    icon: IoExtensionPuzzleOutline,
    artKind: 'simon-duel',
    badge: 'YENİ',
    players: '580',
    color: 'is-violet',
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
    id: 'chess-duel',
    title: 'SATRANÇ DUEL',
    icon: LuSwords,
    artKind: 'chess-duel',
    badge: 'YENİ',
    players: '680',
    color: 'is-violet',
  },
  {
    id: 'space-duel',
    title: 'SPACE DUEL',
    icon: IoRocketOutline,
    artKind: 'space-duel',
    badge: 'YENİ',
    players: '590',
    color: 'is-violet',
  },
  {
    id: 'missile-command-duel',
    title: 'RIFT WARD',
    icon: FiZap,
    artKind: 'missile-command-duel',
    badge: 'YENİ',
    players: '480',
    color: 'is-violet',
  },
  {
    id: 'defender-duel',
    title: 'DEFENDER DUEL',
    icon: IoRocketOutline,
    artKind: 'defender-duel',
    badge: 'YENİ',
    players: '820',
    color: 'is-green',
  },
  {
    id: '1942-duel',
    title: 'SKY ACE DUEL',
    icon: IoRocketOutline,
    artKind: '1942-duel',
    badge: 'YENİ',
    players: '860',
    color: 'is-blue',
  },
]
