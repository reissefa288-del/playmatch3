import { launchPulse, type McSideState } from './missileCommandDuelEngine'

function predictShardPosition(side: McSideState, shardId: number, leadMs: number) {
  const shard = side.shards.find((s) => s.id === shardId)
  if (!shard) return null

  const target = side.nodes.find((n) => n.id === shard.targetId && n.alive) ?? side.nodes.find((n) => n.alive)
  if (!target) return null

  const dx = target.x - shard.x
  const dy = target.y - shard.y
  const d = Math.hypot(dx, dy) || 1
  const nx = dx / d
  const ny = dy / d
  const wobble = Math.sin(shard.wobblePhase) * shard.wobbleAmp

  return {
    x: shard.x + nx * shard.speed * leadMs + -ny * wobble * leadMs,
    y: shard.y + ny * shard.speed * leadMs + nx * wobble * 0.35 * leadMs,
  }
}

export function tickMissileCommandBot(side: McSideState, now: number): McSideState {
  if (side.shards.length === 0) return side

  let next = side
  const threats = [...side.shards].sort((a, b) => b.y - a.y).slice(0, 3)

  for (const m of threats) {
    const lead = predictShardPosition(next, m.id, 320)
    if (!lead) continue

    const existing = next.pulses.some(
      (p) =>
        p.phase === 'burst' ||
        (p.phase === 'fly' && Math.hypot(p.tx - lead.x, p.ty - lead.y) < 10),
    )
    if (existing) continue
    if (Math.random() < 0.15) continue
    next = launchPulse(next, lead.x, lead.y, now)
  }

  return next
}
