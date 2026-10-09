import { FiHeart, FiHome, FiMessageCircle, FiUser } from 'react-icons/fi'
import { LuGamepad2 } from 'react-icons/lu'
import { PiCrownSimpleFill } from 'react-icons/pi'
import { isPremiumFeatureEnabled } from '../premium/premiumAvailability'
import type { BottomNavItem } from './types'

const ALL_BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { id: 'home', label: 'Ana\u00a0Sayfa', icon: FiHome, active: true, to: '/' },
  { id: 'match', label: 'Eşleşme', icon: FiHeart, to: '/match' },
  { id: 'games', label: 'Oyunlar', icon: LuGamepad2, to: '/games' },
  { id: 'chat', label: 'Sohbet', icon: FiMessageCircle, to: '/chat' },
  { id: 'premium', label: 'Premium', icon: PiCrownSimpleFill, to: '/premium', variant: 'premium' },
  { id: 'profile', label: 'Profil', icon: FiUser, to: '/profile' },
]

/** ADIM 8.1 — kapalı testte Premium sekmesi gizli */
export function getBottomNavigationItems(): BottomNavItem[] {
  if (isPremiumFeatureEnabled()) return ALL_BOTTOM_NAV_ITEMS
  return ALL_BOTTOM_NAV_ITEMS.filter((item) => item.id !== 'premium')
}

/** @deprecated use getBottomNavigationItems() */
export const bottomNavigation: BottomNavItem[] = ALL_BOTTOM_NAV_ITEMS
