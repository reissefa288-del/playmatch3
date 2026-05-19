import {
  FiHeart,
  FiHome,
  FiMessageCircle,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import { IoExtensionPuzzleOutline } from 'react-icons/io5'
import { MdEmojiEvents } from 'react-icons/md'
import { LuGamepad2 } from 'react-icons/lu'
import type { BottomNavItem, FavoriteGame, HeroDiscoveryPlayer, NearbyPlayer } from './types'

const heroSocial = (
  lastGame: string,
  today = 'Bugün aktif',
  matches = '4 maç',
  mutuals = '5 ortak arkadaş',
  voice = 'İng. açık',
) => ({ lastGame, today, matches, mutuals, voice })

export const heroDiscoveryQueue: HeroDiscoveryPlayer[] = [
  {
    id: 'zeynep',
    name: 'Zeynep',
    age: 21,
    verified: true,
    isOnline: true,
    distance: '1.2 km uzaklıkta',
    location: 'İstanbul, Türkiye',
    compatibility: 92,
    portraitPosition: '14% 38%',
    social: heroSocial('Son: Black Desert'),
    favoriteGames: [
      { id: 'lol', label: 'LOL' },
      { id: 'valorant', label: 'Valorant' },
      { id: 'bd', label: 'Block' },
    ],
    tags: [
      { label: 'FPS', icon: 'gamepad' },
      { label: 'Rekabetçi', icon: 'gamepad' },
      { label: 'Platinum I', icon: 'trophy' },
    ],
  },
  {
    id: 'mert',
    name: 'Mert',
    age: 24,
    isOnline: true,
    distance: '3.2 km uzaklıkta',
    location: 'İstanbul, Türkiye',
    compatibility: 87,
    portraitPosition: '32% 56%',
    social: heroSocial('Son: XOX'),
    favoriteGames: [
      { id: 'xox', label: 'XOX' },
      { id: 'puzzle', label: 'Puzzle' },
    ],
    tags: [
      { label: 'Strateji', icon: 'gamepad' },
      { label: 'Diamond IV', icon: 'trophy' },
    ],
  },
  {
    id: 'damla',
    name: 'Damla',
    age: 20,
    verified: true,
    isOnline: true,
    distance: '4.1 km uzaklıkta',
    location: 'Kadıköy, İstanbul',
    compatibility: 84,
    portraitPosition: '54% 54%',
    social: heroSocial('Son: Block Duel'),
    favoriteGames: [
      { id: 'block', label: 'Block' },
      { id: 'xox', label: 'XOX' },
    ],
    tags: [
      { label: 'Casual', icon: 'gamepad' },
      { label: 'Gold II', icon: 'trophy' },
    ],
  },
  {
    id: 'ali',
    name: 'Ali',
    age: 23,
    isOnline: true,
    distance: '2.4 km uzaklıkta',
    location: 'Beşiktaş, İstanbul',
    compatibility: 79,
    portraitPosition: '8% 58%',
    social: heroSocial('Son: 8 Top'),
    favoriteGames: [
      { id: '8top', label: '8 Top' },
      { id: 'block', label: 'Block' },
    ],
    tags: [
      { label: 'Multiplayer', icon: 'gamepad' },
      { label: 'Diamond II', icon: 'trophy' },
    ],
  },
  {
    id: 'emir',
    name: 'Emir',
    age: 25,
    isOnline: true,
    distance: '5.0 km uzaklıkta',
    location: 'Üsküdar, İstanbul',
    compatibility: 76,
    portraitPosition: '80% 55%',
    social: heroSocial('Son: Puzzle Rush'),
    favoriteGames: [
      { id: 'puzzle', label: 'Puzzle' },
      { id: 'duel', label: 'Duel' },
    ],
    tags: [
      { label: 'Ranked', icon: 'gamepad' },
      { label: 'Platinum I', icon: 'trophy' },
    ],
  },
]

export const heroPlayerMeta = {
  compatibility: 92,
  distance: '1.2 km uzaklıkta',
  lastGame: 'Son: Black Desert',
  stats: ['Bugün aktif', '4 maç', '5 ortak arkadaş', 'İng. açık'],
}

/** Sprite crop on home-final.png for hero portrait (Zeynep) */
export const heroPortraitPosition = '14% 38%'

export const heroGames: FavoriteGame[] = [
  { id: 'lol', label: 'LOL' },
  { id: 'valorant', label: 'Valorant' },
  { id: 'bd', label: 'Block' },
]

export const nearbyPlayers: NearbyPlayer[] = [
  {
    id: 'ali',
    name: 'Ali',
    age: 23,
    rank: 'Diamond II',
    gameTags: ['Block Duel', 'XOX'],
    distance: '2.4 km',
    isOnline: true,
    gender: 'male',
    portraitPosition: '8% 58%',
  },
  {
    id: 'mert',
    name: 'Mert',
    age: 24,
    rank: 'Diamond IV',
    gameTags: ['Puzzle', '8 Top'],
    distance: '3.2 km',
    isOnline: true,
    gender: 'male',
    portraitPosition: '32% 56%',
  },
  {
    id: 'damla',
    name: 'Damla',
    age: 20,
    rank: 'Gold II',
    gameTags: ['XOX', 'Puzzle'],
    distance: '4.1 km',
    verified: true,
    isOnline: true,
    gender: 'female',
    portraitPosition: '54% 54%',
  },
  {
    id: 'emir',
    name: 'Emir',
    age: 25,
    rank: 'Platinum I',
    gameTags: ['8 Top', 'Block Duel'],
    distance: '5.0 km',
    isOnline: true,
    gender: 'male',
    portraitPosition: '80% 55%',
  },
]

export const nearbyListLiveCaption = {
  activePlayersLabel: '247 oyuncu aktif',
  waitLabel: '3 kişi seni bekliyor',
  ticker: ['Ece Block Duel oynuyor', 'Mert XOX lobisinde', 'Azra puzzle odasi kurdu'],
}

export const quickStartActions = [
  {
    id: 'quick-match',
    title: 'Hızlı Oyun',
    subtitle: 'Rastgele oyuncu ile oyna',
    icon: LuGamepad2,
    accent: 'pink' as const,
  },
  {
    id: 'duo',
    title: 'Duo Bul',
    subtitle: 'Takım arkadaşı bul',
    icon: FiUsers,
    accent: 'blue' as const,
  },
]

export const bottomNavigation: BottomNavItem[] = [
  { id: 'home', label: 'Ana Sayfa', icon: FiHome, active: true, to: '/' },
  { id: 'match', label: 'Eşleşme', icon: FiHeart, to: '/match' },
  { id: 'games', label: 'Oyunlar', icon: LuGamepad2, to: '/games' },
  { id: 'chat', label: 'Sohbet', icon: FiMessageCircle, badge: 2, to: '/chat' },
  { id: 'profile', label: 'Profil', icon: FiUser, to: '/profile' },
]

export const questMeta = {
  title: 'Günlük Görevini Tamamla!',
  subtitle: 'Ödülleri kaçırma, hemen görevlerine göz at.',
  cta: 'Görevlere Git',
  icon: MdEmojiEvents,
  reward: IoExtensionPuzzleOutline,
}