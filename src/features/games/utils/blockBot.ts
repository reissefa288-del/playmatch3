import {
  BLOCK_COLS,
  BLOCK_ROWS,
  cellCount,
  hardDropLane,
  previewPiecePlacement,
  rotationCount,
  spawnColFor,
  type BlockInput,
  type BlockLaneState,
  type PieceKind,
  type PlacementScore,
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
    targetCol: spawnColFor('prism', 0),
    hardDrop: false,
    thinkAt: nowSec + 0.1,
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

function scorePlacement(kind: PieceKind, score: PlacementScore): number {
  const cells = cellCount(kind)
  const heightPenalty = cells >= 5 ? 10 : 7

  return (
    score.fusionCells * 1400 +
    score.surgeCount * 3200 +
    score.cleared * 350 -
    score.aggregateHeight * heightPenalty -
    score.holes * 480 -
    score.bumpiness * 16 +
    (score.fusionCells >= 4 ? 900 : 0) +
    (score.surgeCount >= 1 ? 700 : 0) +
    (score.fusionCells + score.surgeCount >= 6 ? 1200 : 0)
  )
}

function findBestPlacement(lane: BlockLaneState): { rot: number; col: number; hardDrop: boolean } {
  if (!lane.active) {
    return { rot: 0, col: spawnColFor('prism', 0), hardDrop: false }
  }

  let bestScore = -Infinity
  let best = { rot: lane.active.rotation, col: lane.active.col, hardDrop: false }
  const kind = lane.active.kind
  const height = stackHeight(lane)

  for (let rot = 0; rot < rotationCount(kind); rot += 1) {
    const minCol = -1
    const maxCol = BLOCK_COLS
    for (let col = minCol; col < maxCol; col += 1) {
      const preview = previewPiecePlacement(lane.grid, kind, rot, col)
      if (!preview) continue
      const total = preview.fusionCells + preview.surgeCount
      const placementScore = scorePlacement(kind, preview)
      if (placementScore > bestScore) {
        bestScore = placementScore
        best = {
          rot,
          col,
          hardDrop: total >= 3 || (total >= 1 && height > 10) || height > 12,
        }
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
    bot.thinkAt = nowSec + 0.04 + Math.random() * 0.03
    const best = findBestPlacement(lane)
    bot.targetRot = best.rot
    bot.targetCol = best.col
    bot.hardDrop = best.hardDrop
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
