import { isDirectionSafe, type Direction, type TronSideState } from './tronDuelEngine'

const DIRS: Direction[] = ['up', 'down', 'left', 'right']

export function pickTronBotDirection(side: TronSideState): Direction {
  if (!side.alive) return side.queuedDir

  const straight = side.queuedDir
  if (isDirectionSafe(side, straight) && Math.random() > 0.08) {
    return straight
  }

  const options = DIRS.filter((d) => isDirectionSafe(side, d))
  if (options.length === 0) return straight
  return options[Math.floor(Math.random() * options.length)]!
}
