import { launchCounter, type McSideState } from './missileCommandDuelEngine'

export function tickMissileCommandBot(side: McSideState, now: number): McSideState {
  if (side.incoming.length === 0) return side

  let next = side
  const threats = [...side.incoming].sort((a, b) => b.y - a.y).slice(0, 2)

  for (const m of threats) {
    const leadY = m.y + m.vy * 280
    const leadX = m.x + m.vx * 280
    const existing = next.counters.some(
      (c) =>
        c.phase === 'boom' ||
        (c.phase === 'fly' && Math.hypot(c.tx - leadX, c.ty - leadY) < 10),
    )
    if (existing) continue
    if (Math.random() < 0.2) continue
    next = launchCounter(next, leadX, leadY, now)
  }

  return next
}
