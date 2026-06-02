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
    title: 'CUBE DUEL',
    mode: 'Küp puzzle düellosu',
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
    | 'whack-duel'
    | 'rhythm-duel'
    | 'catch-duel'
    | 'slice-duel'
    | 'basket-duel'
    | 'chess-duel'
    | 'galaga-duel'
    | 'asteroids-duel'
    | 'missile-command-duel'
    | 'centipede-duel'
    | 'frogger-duel'
    | 'pac-dot-duel'
    | 'invaders-duel'
    | 'dig-dug-duel'
    | 'tempest-duel'
    | 'breakout-duel'
    | 'robotron-duel'
    | 'joust-duel'
    | 'burger-time-duel'
    | 'donkey-kong-duel'
    | 'qbert-duel'
    | 'paperboy-duel'
    | 'spy-hunter-duel'
    | 'marble-madness-duel'
    | 'defender-duel'
    | 'berzerk-duel'
    | '1942-duel'
    | 'gradius-duel'
    | 'time-pilot-duel'
    | 'gyruss-duel'
    | 'outrun-duel'
    | 'rad-racer-duel'
    | 'enduro-duel'
    | 'contra-duel'
    | 'metal-slug-duel'
    | 'punch-out-duel'
    | 'kung-fu-duel'
    | 'bomberman-duel'
    | 'tron-duel'
    | 'pengo-duel'
    | 'lode-runner-duel'
    | 'space-harrier-duel'
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
  {
    id: 'asteroids-duel',
    title: 'ASTEROIDS DUEL',
    icon: IoRocketOutline,
    artKind: 'asteroids-duel',
    badge: 'YENİ',
    players: '520',
    color: 'is-blue',
  },
  {
    id: 'missile-command-duel',
    title: 'MISSILE CMD',
    icon: FiZap,
    artKind: 'missile-command-duel',
    badge: 'YENİ',
    players: '480',
    color: 'is-green',
  },
  {
    id: 'centipede-duel',
    title: 'CENTIPEDE',
    icon: IoExtensionPuzzleOutline,
    artKind: 'centipede-duel',
    badge: 'YENİ',
    players: '510',
    color: 'is-violet',
  },
  {
    id: 'frogger-duel',
    title: 'FROGGER DUEL',
    icon: IoGameControllerOutline,
    artKind: 'frogger-duel',
    badge: 'YENİ',
    players: '540',
    color: 'is-green',
  },
  {
    id: 'pac-dot-duel',
    title: 'PAC-DOT DUEL',
    icon: IoGameControllerOutline,
    artKind: 'pac-dot-duel',
    badge: 'YENİ',
    players: '560',
    color: 'is-violet',
  },
  {
    id: 'invaders-duel',
    title: 'INVADERS DUEL',
    icon: IoRocketOutline,
    artKind: 'invaders-duel',
    badge: 'YENİ',
    players: '580',
    color: 'is-green',
  },
  {
    id: 'dig-dug-duel',
    title: 'DIG DUG DUEL',
    icon: IoExtensionPuzzleOutline,
    artKind: 'dig-dug-duel',
    badge: 'YENİ',
    players: '600',
    color: 'is-orange',
  },
  {
    id: 'tempest-duel',
    title: 'TEMPEST DUEL',
    icon: IoRocketOutline,
    artKind: 'tempest-duel',
    badge: 'YENİ',
    players: '620',
    color: 'is-violet',
  },
  {
    id: 'breakout-duel',
    title: 'BREAKOUT DUEL',
    icon: IoGameControllerOutline,
    artKind: 'breakout-duel',
    badge: 'YENİ',
    players: '640',
    color: 'is-pink',
  },
  {
    id: 'robotron-duel',
    title: 'ROBOTRON DUEL',
    icon: IoRocketOutline,
    artKind: 'robotron-duel',
    badge: 'YENİ',
    players: '660',
    color: 'is-orange',
  },
  {
    id: 'joust-duel',
    title: 'JOUST DUEL',
    icon: IoExtensionPuzzleOutline,
    artKind: 'joust-duel',
    badge: 'YENİ',
    players: '680',
    color: 'is-blue',
  },
  {
    id: 'burger-time-duel',
    title: 'BURGERTIME DUEL',
    icon: IoGameControllerOutline,
    artKind: 'burger-time-duel',
    badge: 'YENİ',
    players: '700',
    color: 'is-orange',
  },
  {
    id: 'donkey-kong-duel',
    title: 'DONKEY KONG DUEL',
    icon: IoExtensionPuzzleOutline,
    artKind: 'donkey-kong-duel',
    badge: 'YENİ',
    players: '720',
    color: 'is-violet',
  },
  {
    id: 'qbert-duel',
    title: 'Q*BERT DUEL',
    icon: IoExtensionPuzzleOutline,
    artKind: 'qbert-duel',
    badge: 'YENİ',
    players: '740',
    color: 'is-orange',
  },
  {
    id: 'paperboy-duel',
    title: 'PAPERBOY DUEL',
    icon: IoRocketOutline,
    artKind: 'paperboy-duel',
    badge: 'YENİ',
    players: '760',
    color: 'is-green',
  },
  {
    id: 'spy-hunter-duel',
    title: 'SPY HUNTER DUEL',
    icon: IoRocketOutline,
    artKind: 'spy-hunter-duel',
    badge: 'YENİ',
    players: '780',
    color: 'is-blue',
  },
  {
    id: 'marble-madness-duel',
    title: 'MARBLE MADNESS DUEL',
    icon: IoExtensionPuzzleOutline,
    artKind: 'marble-madness-duel',
    badge: 'YENİ',
    players: '800',
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
    id: 'berzerk-duel',
    title: 'BERZERK DUEL',
    icon: IoGameControllerOutline,
    artKind: 'berzerk-duel',
    badge: 'YENİ',
    players: '840',
    color: 'is-orange',
  },
  {
    id: '1942-duel',
    title: '1942 DUEL',
    icon: IoRocketOutline,
    artKind: '1942-duel',
    badge: 'YENİ',
    players: '860',
    color: 'is-blue',
  },
  {
    id: 'gradius-duel',
    title: 'GRADIUS DUEL',
    icon: IoRocketOutline,
    artKind: 'gradius-duel',
    badge: 'YENİ',
    players: '880',
    color: 'is-violet',
  },
  {
    id: 'time-pilot-duel',
    title: 'TIME PILOT DUEL',
    icon: IoRocketOutline,
    artKind: 'time-pilot-duel',
    badge: 'YENİ',
    players: '900',
    color: 'is-orange',
  },
  {
    id: 'gyruss-duel',
    title: 'GYRUSS DUEL',
    icon: IoRocketOutline,
    artKind: 'gyruss-duel',
    badge: 'YENİ',
    players: '920',
    color: 'is-violet',
  },
  {
    id: 'outrun-duel',
    title: 'OUTRUN DUEL',
    icon: IoRocketOutline,
    artKind: 'outrun-duel',
    badge: 'YENİ',
    players: '940',
    color: 'is-pink',
  },
  {
    id: 'rad-racer-duel',
    title: 'RAD RACER DUEL',
    icon: IoRocketOutline,
    artKind: 'rad-racer-duel',
    badge: 'YENİ',
    players: '960',
    color: 'is-blue',
  },
  {
    id: 'enduro-duel',
    title: 'ENDURO DUEL',
    icon: IoRocketOutline,
    artKind: 'enduro-duel',
    badge: 'YENİ',
    players: '980',
    color: 'is-orange',
  },
  {
    id: 'contra-duel',
    title: 'CONTRA DUEL',
    icon: IoRocketOutline,
    artKind: 'contra-duel',
    badge: 'YENİ',
    players: '1000',
    color: 'is-green',
  },
  {
    id: 'metal-slug-duel',
    title: 'METAL SLUG DUEL',
    icon: IoRocketOutline,
    artKind: 'metal-slug-duel',
    badge: 'YENİ',
    players: '1020',
    color: 'is-orange',
  },
  {
    id: 'punch-out-duel',
    title: 'PUNCH-OUT DUEL',
    icon: IoRocketOutline,
    artKind: 'punch-out-duel',
    badge: 'YENİ',
    players: '1040',
    color: 'is-violet',
  },
  {
    id: 'kung-fu-duel',
    title: 'KUNG-FU DUEL',
    icon: IoRocketOutline,
    artKind: 'kung-fu-duel',
    badge: 'YENİ',
    players: '1060',
    color: 'is-pink',
  },
  {
    id: 'bomberman-duel',
    title: 'BOMBERMAN DUEL',
    icon: IoRocketOutline,
    artKind: 'bomberman-duel',
    badge: 'YENİ',
    players: '1080',
    color: 'is-blue',
  },
  {
    id: 'tron-duel',
    title: 'TRON DUEL',
    icon: IoRocketOutline,
    artKind: 'tron-duel',
    badge: 'YENİ',
    players: '1100',
    color: 'is-violet',
  },
  {
    id: 'pengo-duel',
    title: 'PENGO DUEL',
    icon: IoRocketOutline,
    artKind: 'pengo-duel',
    badge: 'YENİ',
    players: '1120',
    color: 'is-blue',
  },
  {
    id: 'lode-runner-duel',
    title: 'LODE RUNNER DUEL',
    icon: IoRocketOutline,
    artKind: 'lode-runner-duel',
    badge: 'YENİ',
    players: '1140',
    color: 'is-orange',
  },
  {
    id: 'space-harrier-duel',
    title: 'SPACE HARRIER DUEL',
    icon: IoRocketOutline,
    artKind: 'space-harrier-duel',
    badge: 'YENİ',
    players: '1160',
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
