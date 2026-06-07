import type { TabId } from './tabConfig'

const prefetched = new Set<TabId>()

function scheduleIdle(task: () => void) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(task, { timeout: 4500 })
    return
  }
  window.setTimeout(task, 1400)
}

/** Aktif tab dışındaki sık kullanılan tab chunk'larını idle'da önceden yükle */
export function prefetchTabRoutes(activeTab: TabId) {
  scheduleIdle(() => {
    if (activeTab !== 'match' && !prefetched.has('match')) {
      prefetched.add('match')
      void import('../features/match/MatchScreen')
    }
    if (activeTab !== 'games' && !prefetched.has('games')) {
      prefetched.add('games')
      void import('../features/games/GamesScreen')
    }
  })
}

/** Oyunlar sekmesi açıkken popüler duel chunk'larını ısıt */
export function prefetchPopularGameRoutes() {
  scheduleIdle(() => {
    void import('../features/games/GamesScreen')
    void import('../features/games/game1942DuelRuntime').then((m) => m.preloadGame1942DuelRuntime())
  })
}
