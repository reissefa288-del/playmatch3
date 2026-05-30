import { isInSlug, tryFire, tryGrenade, tryJump, tryMove, type MetalSlugSideState } from './metalSlugDuelEngine'

export function tickMetalSlugBot(side: MetalSlugSideState, now: number): MetalSlugSideState {
  if (side.lives <= 0) return side

  let s = side
  const slug = isInSlug(s, now)
  const pickup = s.pickups[0]
  if (pickup && !slug) {
    if (pickup.x > s.px + 4) s = tryMove(s, 'right', now)
    else if (pickup.x < s.px - 4) s = tryMove(s, 'left', now)
  }

  const nearest = s.enemies
    .filter((e) => e.x > s.px && e.x < s.px + 58)
    .sort((a, b) => a.x - b.x)[0]

  if (nearest) {
    if (!slug && Math.abs(nearest.y - s.py) > 10 && s.groundedY != null) s = tryJump(s, now)
    if (nearest.x > s.px + 10) s = tryMove(s, 'right', now)
    s = tryFire(s, now)
    if (!slug && nearest.kind === 'tank' && Math.random() < 0.02) s = tryGrenade(s, now)
  } else {
    if (Math.random() < 0.018) s = tryMove(s, Math.random() > 0.5 ? 'right' : 'left', now)
  }

  const chopper = s.enemies.find((e) => e.kind === 'chopper' && e.x < 82)
  if (chopper && !slug && Math.random() < 0.015) s = tryGrenade(s, now)

  if (Math.random() < 0.022) s = tryFire(s, now)

  return s
}
