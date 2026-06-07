import type { ComponentType, LazyExoticComponent } from 'react'
import { lazyNamed } from '../shared/lazyNamed'

export type TabId = 'home' | 'match' | 'games' | 'chat' | 'premium' | 'profile'

export type TabDefinition = {
  id: TabId
  path: string
  Component: LazyExoticComponent<ComponentType> | ComponentType
}

/** Bottom dock: 5 tabs (video 15:35 — Premium ayrı rota, dock’ta yok) */
export const MAIN_TABS: TabDefinition[] = [
  { id: 'home', path: '/', Component: lazyNamed(() => import('../features/home/HomeScreen'), 'HomeScreen') },
  { id: 'match', path: '/match', Component: lazyNamed(() => import('../features/match/MatchScreen'), 'MatchScreen') },
  { id: 'games', path: '/games', Component: lazyNamed(() => import('../features/games/GamesScreen'), 'GamesScreen') },
  { id: 'chat', path: '/chat', Component: lazyNamed(() => import('../features/chat/ChatScreen'), 'ChatScreen') },
  {
    id: 'profile',
    path: '/profile',
    Component: lazyNamed(() => import('../features/profile/ProfileScreen'), 'ProfileScreen'),
  },
]

export const PREMIUM_TAB: TabDefinition = {
  id: 'premium',
  path: '/premium',
  Component: lazyNamed(() => import('../features/premium/PremiumScreen'), 'PremiumScreen'),
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

  if (/^\/games(\/|$)/.test(path)) {
    return 'games'
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
