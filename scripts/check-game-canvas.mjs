/**
 * Faz J — game canvas & duel hook guards (CI).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

const errors = []

const canvasFiles = [
  'src/features/games/components/SnakeArenaCanvas.tsx',
  'src/features/games/components/BlockBoardCanvas.tsx',
  'src/features/games/components/BubbleShooterCanvas.tsx',
  'src/features/games/components/BrickBreakCanvas.tsx',
]

for (const file of canvasFiles) {
  const src = read(file)
  if (!/canvasDprCap|from ['"].*\/canvasDpr|canvasDpr\(\)/.test(src)) {
    errors.push(`${file}: use canvasDprCap() for devicePixelRatio`)
  }
  if (!/releaseCanvas/.test(src)) {
    errors.push(`${file}: call releaseCanvas() on unmount`)
  }
}

if (!read('src/features/games/utils/bubbleCanvasVisuals.ts').includes('canvasDprCap')) {
  errors.push('bubbleCanvasVisuals.ts must use shared canvasDprCap')
}

const duelHooks = [
  'src/features/games/useStackDuel.ts',
  'src/features/games/useNeonCrushDuel.ts',
  'src/features/games/useBubbleShooterDuel.ts',
  'src/features/games/useGame1942Duel.ts',
]

for (const file of duelHooks) {
  const src = read(file)
  const hasManaged = /useManagedTimeout|useManagedTimers/.test(src)
  const hasBatching = /startTransition|syncUiTickRef|syncTickRef/.test(src)
  if (!hasManaged) {
    errors.push(`${file}: bot/FX timers must use useManagedTimeout or useManagedTimers`)
  }
  if (!hasBatching) {
    errors.push(`${file}: duel sim updates must batch React renders (startTransition or sync tick ref)`)
  }
}

if (!read('src/features/games/game1942DuelRuntime.ts').includes('loadGame1942DuelRuntime')) {
  errors.push('game1942DuelRuntime.ts: engine must lazy-load (J5 defer heavy work off initial route)')
}

if (errors.length) {
  console.error('Game canvas check failed:\n')
  errors.forEach((line) => console.error(`  • ${line}`))
  process.exit(1)
}

console.log('Game canvas check passed (DPR cap, canvas release, duel batching).')
