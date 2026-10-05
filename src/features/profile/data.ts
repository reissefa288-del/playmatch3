import { FiGrid } from 'react-icons/fi'
import {
  IoExtensionPuzzleOutline,
  IoGameControllerOutline,
  IoRocketOutline,
} from 'react-icons/io5'
import { LuTrophy } from 'react-icons/lu'
import type { IconType } from 'react-icons'

export const profileUser = {
  username: 'Emirhan',
  verified: true,
  age: 24,
  location: 'İstanbul, Türkiye',
  bio: 'Oyun sadece bir hobi değil, bir yaşam tarzı. Gerçek bağlantılar, güzel anlar yaratır. 🎮✨',
  isOnline: true,
  portraitPosition: '50% 22%',
  editLabel: 'Düzenle',
}

export const profileRank = {
  tier: 'Çaylak',
  label: 'Seviye 1',
  current: 0,
  max: 5000,
  emblem: LuTrophy,
}

export type ProfileFavoriteGame = {
  id: string
  title: string
  icon: IconType
  artPosition: string
  accent: 'pink' | 'blue' | 'violet' | 'cyan'
}

export const profileFavoriteGames: ProfileFavoriteGame[] = [
  { id: 'xox', title: 'XOX', icon: FiGrid, artPosition: '12% 42%', accent: 'pink' },
  {
    id: 'block-duel',
    title: 'Block Duel',
    icon: IoRocketOutline,
    artPosition: '32% 42%',
    accent: 'blue',
  },
  {
    id: '8-ball',
    title: '8 Ball Pool',
    icon: IoGameControllerOutline,
    artPosition: '52% 42%',
    accent: 'cyan',
  },
  {
    id: 'puzzle',
    title: 'Puzzle',
    icon: IoExtensionPuzzleOutline,
    artPosition: '72% 42%',
    accent: 'violet',
  },
]

export type ProfileStat = {
  id: string
  value: string
  label: string
}

export const profileStats: ProfileStat[] = [
  { id: 'friends', value: '0', label: 'Arkadaş' },
  { id: 'likes', value: '0', label: 'Beğeni' },
  { id: 'visitors', value: '0', label: 'Ziyaretçi' },
  { id: 'matches', value: '0', label: 'Ortak Match' },
]

export type ProfileAchievement = {
  id: string
  label: string
  accent: 'gold' | 'violet' | 'blue' | 'pink'
  icon: IconType
}

export const profileAchievements: ProfileAchievement[] = [
  { id: 'streak', label: 'Seri', accent: 'gold', icon: LuTrophy },
  { id: 'ranked', label: 'Rank', accent: 'violet', icon: LuTrophy },
  { id: 'social', label: 'Sosyal', accent: 'blue', icon: LuTrophy },
  { id: 'veteran', label: 'Veteran', accent: 'pink', icon: LuTrophy },
]

export const profileAchievementMore = 12

export type ProfileActivity = {
  id: string
  text: string
  time: string
  gameId: string
  artPosition: string
}

export const profileRecentActivity: ProfileActivity[] = [
  {
    id: 'a1',
    text: 'XOX oynadı',
    time: '5 dk önce',
    gameId: 'xox',
    artPosition: '12% 42%',
  },
  {
    id: 'a2',
    text: 'Block Duel kazandı',
    time: '1 saat önce',
    gameId: 'block-duel',
    artPosition: '32% 42%',
  },
  {
    id: 'a3',
    text: '8 Ball Pool oynadı',
    time: '3 saat önce',
    gameId: '8-ball',
    artPosition: '52% 42%',
  },
  {
    id: 'a4',
    text: 'Puzzle tamamladı',
    time: 'Dün',
    gameId: 'puzzle',
    artPosition: '72% 42%',
  },
]
