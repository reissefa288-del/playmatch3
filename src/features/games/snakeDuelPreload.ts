/** Snake Duel route — oyun kartında hover ile önceden yükle */
let preloadPromise: Promise<unknown> | null = null

export function preloadSnakeDuel() {
  if (!preloadPromise) {
    preloadPromise = import('./SnakeDuelScreen')
  }
  return preloadPromise
}
