import {
  BLOCK_COLS,
  BLOCK_ROWS,
  hardDropLane,
  holdPiece,
  previewPiecePlacement,
  type BlockInput,
  type BlockLaneState,
  updateBlockLane,
} from './blockEngine'

const BUFFER_ROWS = 2

export type BlockBotBrain = {
  targetRot: number
  targetCol: number
  hardDrop: boolean
  thinkAt: number
  pending: BlockInput
}

export function createBlockBot(nowSec: number): BlockBotBrain {
  return {
    targetRot: 0,
    targetCol: 4,
    hardDrop: false,
    thinkAt: nowSec + 0.2,
    pending: {},
  }
}

function stackHeight(lane: BlockLaneState): number {
  for (let row = BUFFER_ROWS; row < BUFFER_ROWS + BLOCK_ROWS; row += 1) {
    if (lane.grid[row]?.some((cell) => cell != null)) {
      return BUFFER_ROWS + BLOCK_ROWS - row
    }
  }
  return 0
}

function scorePlacement(
  cleared: number,
  aggregateHeight: number,
  holes: number,
  bumpiness: number,
): number {
  return (
    cleared * 8200 -
    aggregateHeight * 8 -
    holes * 420 -
    bumpiness * 14 +
    (cleared >= 2 ? 600 : 0) +
    (cleared >= 4 ? 2400 : 0)
  )
}

function findBestPlacement(lane: BlockLaneState): { rot: number; col: number; hardDrop: boolean } {
  if (!lane.active) return { rot: 0, col: 4, hardDrop: false }

  let bestScore = -Infinity
  let best = { rot: lane.active.rotation, col: lane.active.col, hardDrop: false }
  const kind = lane.active.kind

  for (let rot = 0; rot < (kind === 'O' ? 1 : 4); rot += 1) {
    for (let col = -2; col < BLOCK_COLS; col += 1) {
      const preview = previewPiecePlacement(lane.grid, kind, rot, col)
      if (!preview) continue
      const score = scorePlacement(
        preview.cleared,
        preview.aggregateHeight,
        preview.holes,
        preview.bumpiness,
      )
      if (score > bestScore) {
        bestScore = score
        best = { rot, col, hardDrop: preview.cleared >= 2 || stackHeight(lane) > 11 }
      }
    }
  }

  return best
}

function buildInputTowardTarget(lane: BlockLaneState, bot: BlockBotBrain): BlockInput {
  if (!lane.active) return {}

  if (bot.targetRot !== lane.active.rotation) {
    return { rotate: true }
  }

  if (lane.active.col < bot.targetCol) return { right: true }
  if (lane.active.col > bot.targetCol) return { left: true }

  if (bot.hardDrop) return {}
  return { down: true }
}

export function updateBlockBotLane(
  lane: BlockLaneState,
  dt: number,
  nowSec: number,
  bot: BlockBotBrain,
): { lane: BlockLaneState; events: ReturnType<typeof updateBlockLane>['events']; attackSent: number } {
  const events: ReturnType<typeof updateBlockLane>['events'] = []

  if (nowSec >= bot.thinkAt || !lane.active) {
    bot.thinkAt = nowSec + 0.08 + Math.random() * 0.06
    const best = findBestPlacement(lane)
    bot.targetRot = best.rot
    bot.targetCol = best.col
    bot.hardDrop = best.hardDrop
  }

  if (lane.active && lane.canHold && lane.holdKind === null && lane.active.kind === 'O' && stackHeight(lane) > 9) {
    const held = holdPiece(lane, () => Math.random())
    events.push(...held.events)
    if (held.events.includes('hold')) {
      return { lane: held.lane, events, attackSent: 0 }
    }
  }

  if (
    lane.active &&
    bot.targetRot === lane.active.rotation &&
    lane.active.col === bot.targetCol &&
    bot.hardDrop
  ) {
    const dropped = hardDropLane(lane)
    events.push(...dropped.events)
    return { lane: dropped.lane, events, attackSent: dropped.attackSent }
  }

  bot.pending = buildInputTowardTarget(lane, bot)
  const input = bot.pending
  bot.pending = {}

  const result = updateBlockLane(lane, dt, input)
  events.push(...result.events)
  return { lane: result.lane, events, attackSent: result.attackSent }
}
