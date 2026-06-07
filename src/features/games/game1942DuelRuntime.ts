import type * as Game1942Bot from './utils/game1942DuelBot'
import type * as Game1942Engine from './utils/game1942DuelEngine'
import type * as Game1942Fx from './utils/game1942DuelFx'

export type Game1942DuelRuntime = {
  engine: typeof Game1942Engine
  bot: typeof Game1942Bot
  fx: typeof Game1942Fx
}

let loadPromise: Promise<Game1942DuelRuntime> | null = null

export function loadGame1942DuelRuntime(): Promise<Game1942DuelRuntime> {
  if (!loadPromise) {
    loadPromise = Promise.all([
      import('./utils/game1942DuelEngine'),
      import('./utils/game1942DuelBot'),
      import('./utils/game1942DuelFx'),
    ]).then(([engine, bot, fx]) => ({ engine, bot, fx }))
  }
  return loadPromise
}

export function preloadGame1942DuelRuntime() {
  void loadGame1942DuelRuntime()
}
