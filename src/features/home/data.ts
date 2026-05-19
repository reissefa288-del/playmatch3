import {
  FiHeart,
  FiHome,
  FiMessageCircle,
  FiUser,
} from 'react-icons/fi'
import { LuGamepad2 } from 'react-icons/lu'
import type { BottomNavItem, FavoriteGame, HeroDiscoveryPlayer, NearbyPlayer } from './types'

const heroSocial = (
  lastGame: string,
  today = 'Bugün aktif',
  matches = '4 maç',
  mutuals = '5 ortak',
  voice = 'İng. açık',
) => ({ lastGame, today, matches, mutuals, voice })

export const heroDiscoveryQueue: HeroDiscoveryPlayer[] = [
  {
    id: 'zeynep',
    name: 'Zeynep',
    age: 21,
    verified: true,
    isOnline: true,
    distance: '1.2 km',
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
    distance: '3.2 km',
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
    distance: '4.1 km',
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
    distance: '2.4 km',
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
    distance: '5.0 km',
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
  distance: '1.2 km',
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
    recentActivity: 'Az önce Block Duel oynadı',
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
    recentActivity: 'XOX lobisinde',
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
    recentActivity: 'Puzzle odası kurdu',
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
    recentActivity: '8 Top maçında',
  },
  {
    id: 'ece',
    name: 'Ece',
    age: 22,
    rank: 'Platinum III',
    gameTags: ['Valorant', 'LOL'],
    distance: '1.8 km',
    verified: true,
    isOnline: true,
    gender: 'female',
    portraitPosition: '20% 42%',
    recentActivity: 'Ranked arıyor',
  },
  {
    id: 'azra',
    name: 'Azra',
    age: 19,
    rank: 'Gold I',
    gameTags: ['Block', 'XOX'],
    distance: '2.9 km',
    isOnline: true,
    gender: 'female',
    portraitPosition: '45% 48%',
    recentActivity: 'Az önce çevrimiçi oldu',
  },
  {
    id: 'can',
    name: 'Can',
    age: 26,
    rank: 'Diamond I',
    gameTags: ['Block Duel', '8 Top'],
    distance: '3.6 km',
    isOnline: true,
    gender: 'male',
    portraitPosition: '68% 52%',
    recentActivity: 'Duo arıyor',
  },
  {
    id: 'selin',
    name: 'Selin',
    age: 21,
    rank: 'Platinum II',
    gameTags: ['Puzzle', 'Block'],
    distance: '4.4 km',
    verified: true,
    isOnline: false,
    gender: 'female',
    portraitPosition: '12% 62%',
    recentActivity: '15 dk önce aktifti',
  },
  {
    id: 'berk',
    name: 'Berk',
    age: 24,
    rank: 'Master',
    gameTags: ['LOL', 'Valorant'],
    distance: '5.2 km',
    isOnline: true,
    gender: 'male',
    portraitPosition: '38% 60%',
    recentActivity: 'Lobiye davet gönderdi',
  },
  {
    id: 'ilayda',
    name: 'İlayda',
    age: 20,
    rank: 'Gold III',
    gameTags: ['XOX', 'Puzzle'],
    distance: '6.1 km',
    isOnline: true,
    gender: 'female',
    portraitPosition: '72% 44%',
    recentActivity: 'Yeni eşleşme isteği',
  },
]

export const nearbyListLiveCaption = {
  activePlayersLabel: '247 oyuncu aktif',
  waitLabel: '3 kişi seni bekliyor',
  ticker: ['Ece Block Duel oynuyor', 'Mert XOX lobisinde', 'Azra puzzle odasi kurdu'],
  sectionEyebrow: 'Lobi şu an canlı · 18 davet aktif',
}

export const premiumUnlockBanner = {
  title: "Premium'a Geç",
  subtitle: 'Sınırsız eşleşme, rozetler ve öncelikli lobiler seni bekliyor.',
  perks: ['Sınırsız beğeni', 'Öncelikli eşleşme', 'Özel rozetler'],
  cta: "Premium'a Geç",
}

export const bottomNavigation: BottomNavItem[] = [
  { id: 'home', label: 'Ana\u00a0Sayfa', icon: FiHome, active: true, to: '/' },
  { id: 'match', label: 'Eşleşme', icon: FiHeart, to: '/match' },
  { id: 'games', label: 'Oyunlar', icon: LuGamepad2, to: '/games' },
  { id: 'chat', label: 'Sohbet', icon: FiMessageCircle, badge: 2, to: '/chat' },
  { id: 'profile', label: 'Profil', icon: FiUser, to: '/profile' },
]
