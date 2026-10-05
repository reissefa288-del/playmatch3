import { FiZap } from 'react-icons/fi'
import { IoGameControllerOutline } from 'react-icons/io5'
import type { IconType } from 'react-icons'

export type GamesHeroStat = {
  id: 'online' | 'active'
  icon: IconType
  label: string
}

export const gamesHeroStats: GamesHeroStat[] = [
  { id: 'online', icon: IoGameControllerOutline, label: '3.842 oyuncu çevrimiçi' },
  { id: 'active', icon: FiZap, label: '42 aktif maç' },
]
