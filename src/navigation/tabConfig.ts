import type { ComponentType } from 'react'
import { ChatScreen } from '../features/chat/ChatScreen'
import { GamesScreen } from '../features/games/GamesScreen'
import { HomeScreen } from '../features/home/HomeScreen'
import { MatchScreen } from '../features/match/MatchScreen'
import { PremiumScreen } from '../features/premium/PremiumScreen'
import { ProfileScreen } from '../features/profile/ProfileScreen'

export type TabId = 'home' | 'match' | 'games' | 'chat' | 'premium' | 'profile'

export type TabDefinition = {
  id: TabId
  path: string
  Component: ComponentType
}

/** Bottom dock: 5 tabs (video 15:35 — Premium ayrı rota, dock’ta yok) */
export const MAIN_TABS: TabDefinition[] = [
  { id: 'home', path: '/', Component: HomeScreen },
  { id: 'match', path: '/match', Component: MatchScreen },
  { id: 'games', path: '/games', Component: GamesScreen },
  { id: 'chat', path: '/chat', Component: ChatScreen },
  { id: 'profile', path: '/profile', Component: ProfileScreen },
]

export const PREMIUM_TAB: TabDefinition = {
  id: 'premium',
  path: '/premium',
  Component: PremiumScreen,
}

export const TAB_ORDER: TabId[] = MAIN_TABS.map((tab) => tab.id)

const TAB_PATHS: Record<Exclude<TabId, 'premium'>, string> = Object.fromEntries(
  MAIN_TABS.map((tab) => [tab.id, tab.path]),
) as Record<Exclude<TabId, 'premium'>, string>

export function resolveTabId(pathname: string): TabId | null {
  const path = pathname.replace(/\/$/, '') || '/'

  if (/^\/chat\/[^/]+$/.test(path)) {
    return 'chat'
  }

  if (path === '/' || path === '/nearby') {
    return 'home'
  }

  for (const tab of MAIN_TABS) {
    if (tab.path !== '/' && path === tab.path) {
      return tab.id
    }
  }

  if (path === PREMIUM_TAB.path) {
    return 'premium'
  }

  return null
}

export function getTabPath(tabId: TabId): string {
  if (tabId === 'premium') {
    return PREMIUM_TAB.path
  }
  return TAB_PATHS[tabId]
}

export function getTabDirection(from: TabId, to: TabId): number {
  const fromIndex = TAB_ORDER.indexOf(from)
  const toIndex = TAB_ORDER.indexOf(to)
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return 0
  }
  return toIndex > fromIndex ? 1 : -1
}
