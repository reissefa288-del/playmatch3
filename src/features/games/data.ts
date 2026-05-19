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
