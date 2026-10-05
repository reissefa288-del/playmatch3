/** Duel arka plan videosu — yalnızca Game1942DuelPlay mount'unda çağırın (Faz E2). */
export async function loadDuelVideoSrc(): Promise<string> {
  const probe = document.createElement('video')
  const prefersWebM = probe.canPlayType('video/webm; codecs="vp9"') !== ''
  if (prefersWebM) {
    return (await import('../reference/opt/video/duel-bg.webm?url')).default
  }
  return (await import('../reference/opt/video/duel-bg.mp4?url')).default
}
