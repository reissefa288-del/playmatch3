function scheduleIdle(task: () => void) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(task, { timeout: 4500 })
    return
  }
  window.setTimeout(task, 1400)
}

/** Oyunlar sekmesinde popüler duel runtime'larını ısıt — ayrı modül; index kritik yoluna girmesin. */
export function prefetchPopularGameRoutes() {
  scheduleIdle(() => {
    void import('../features/games/game1942DuelRuntime').then((m) => m.preloadGame1942DuelRuntime())
    void import('../features/games/snakeDuelPreload').then((m) => m.preloadSnakeDuel())
  })
}
