import type { CSSProperties } from 'react'
import chessArtFull from '../../reference/opt/full/c1.webp'
import chessArtThumb from '../../reference/opt/thumb/c1.webp'
import neonCrushArtFull from '../../reference/opt/full/3.webp'
import neonCrushArtThumb from '../../reference/opt/thumb/3.webp'
import memoryUiArtFull from '../../reference/opt/full/2.webp'
import memoryUiArtThumb from '../../reference/opt/thumb/2.webp'
import mineDuelArtFull from '../../reference/opt/full/5.webp'
import mineDuelArtThumb from '../../reference/opt/thumb/5.webp'
import blockArtFull from '../../reference/opt/full/block.webp'
import blockArtThumb from '../../reference/opt/thumb/block.webp'
import brickArtFull from '../../reference/opt/full/brick.webp'
import brickArtThumb from '../../reference/opt/thumb/brick.webp'
import bubbleArtFull from '../../reference/opt/full/bubble.webp'
import bubbleArtThumb from '../../reference/opt/thumb/bubble.webp'
import colorMatchCoverFull from '../../reference/opt/full/color-match-duel.webp'
import colorMatchCoverThumb from '../../reference/opt/thumb/color-match-duel.webp'
import pongDuelCoverFull from '../../reference/opt/full/pong-duel.webp'
import pongDuelCoverThumb from '../../reference/opt/thumb/pong-duel.webp'
import simonDuelCoverFull from '../../reference/opt/full/simon-duel.webp'
import simonDuelCoverThumb from '../../reference/opt/thumb/simon-duel.webp'
import snakeDuelCoverFull from '../../reference/opt/full/snake-duel.webp'
import snakeDuelCoverThumb from '../../reference/opt/thumb/snake-duel.webp'
import galaxyArtFull from '../../reference/opt/full/galaxy.webp'
import galaxyArtThumb from '../../reference/opt/thumb/galaxy.webp'
import mathArtFull from '../../reference/opt/full/math.webp'
import mathArtThumb from '../../reference/opt/thumb/math.webp'
import memoryArtFull from '../../reference/opt/full/memory.webp'
import memoryArtThumb from '../../reference/opt/thumb/memory.webp'
import gemMatchArtFull from '../../reference/opt/full/mor.webp'
import gemMatchArtThumb from '../../reference/opt/thumb/mor.webp'
import stackArtFull from '../../reference/opt/full/stack.webp'
import stackArtThumb from '../../reference/opt/thumb/stack.webp'
import vsArtFull from '../../reference/opt/full/vs.webp'
import vsArtThumb from '../../reference/opt/thumb/vs.webp'
import xoxArtFull from '../../reference/opt/full/xox.webp'
import xoxArtThumb from '../../reference/opt/thumb/xox.webp'

export type GameArtSize = 'full' | 'thumb'

type ArtPair = { full: string; thumb: string }

function pair(full: string, thumb: string): ArtPair {
  return { full, thumb }
}

const GAME_ART_BY_KIND: Record<string, ArtPair> = {
  'bubble-shooter': pair(bubbleArtFull, bubbleArtThumb),
  'brick-break': pair(brickArtFull, brickArtThumb),
  'block-duel': pair(blockArtFull, blockArtThumb),
  xox: pair(xoxArtFull, xoxArtThumb),
  memory: pair(memoryArtFull, memoryArtThumb),
  stack: pair(stackArtFull, stackArtThumb),
  math: pair(mathArtFull, mathArtThumb),
  'math-duel': pair(mathArtFull, mathArtThumb),
  'color-match': pair(colorMatchCoverFull, colorMatchCoverThumb),
  'neon-crush': pair(neonCrushArtFull, neonCrushArtThumb),
  snake: pair(snakeDuelCoverFull, snakeDuelCoverThumb),
  'snake-duel': pair(snakeDuelCoverFull, snakeDuelCoverThumb),
  pong: pair(pongDuelCoverFull, pongDuelCoverThumb),
  'pong-duel': pair(pongDuelCoverFull, pongDuelCoverThumb),
  'simon-duel': pair(simonDuelCoverFull, simonDuelCoverThumb),
  'slice-duel': pair(memoryUiArtFull, memoryUiArtThumb),
  'chess-duel': pair(chessArtFull, chessArtThumb),
  'space-duel': pair(galaxyArtFull, galaxyArtThumb),
  'missile-command-duel': pair(galaxyArtFull, galaxyArtThumb),
  'defender-duel': pair(mineDuelArtFull, mineDuelArtThumb),
  '1942-duel': pair(galaxyArtFull, galaxyArtThumb),
  'word-arena': pair(memoryUiArtFull, memoryUiArtThumb),
}

const GAME_ART_BY_ID: Record<string, ArtPair> = {
  'bubble-shooter-duel': pair(bubbleArtFull, bubbleArtThumb),
  'brick-break-duel': pair(brickArtFull, brickArtThumb),
  'block-duel': pair(blockArtFull, blockArtThumb),
  xox: pair(xoxArtFull, xoxArtThumb),
  'memory-duel': pair(memoryArtFull, memoryArtThumb),
  'stack-duel': pair(stackArtFull, stackArtThumb),
  'math-duel': pair(mathArtFull, mathArtThumb),
  'color-match-duel': pair(colorMatchCoverFull, colorMatchCoverThumb),
  'color-match': pair(colorMatchCoverFull, colorMatchCoverThumb),
  'neon-crush-duel': pair(neonCrushArtFull, neonCrushArtThumb),
  'snake-duel': pair(snakeDuelCoverFull, snakeDuelCoverThumb),
  'pong-duel': pair(pongDuelCoverFull, pongDuelCoverThumb),
  'simon-duel': pair(simonDuelCoverFull, simonDuelCoverThumb),
  'slice-duel': pair(memoryUiArtFull, memoryUiArtThumb),
  'chess-duel': pair(chessArtFull, chessArtThumb),
  'space-duel': pair(galaxyArtFull, galaxyArtThumb),
  'missile-command-duel': pair(galaxyArtFull, galaxyArtThumb),
  'defender-duel': pair(mineDuelArtFull, mineDuelArtThumb),
  '1942-duel': pair(galaxyArtFull, galaxyArtThumb),
  'kelime-savasi': pair(memoryUiArtFull, memoryUiArtThumb),
  'mini-satranc': pair(chessArtFull, chessArtThumb),
  'hafiza-arena': pair(memoryArtFull, memoryArtThumb),
  '8-top-duo': pair(vsArtFull, vsArtThumb),
  'sayi-avcisi': pair(mathArtFull, mathArtThumb),
  'kart-savasi': pair(gemMatchArtFull, gemMatchArtThumb),
  'rank-yarisi': pair(vsArtFull, vsArtThumb),
}

function resolveArtPair(gameId: string, artKind?: string): ArtPair | undefined {
  return GAME_ART_BY_ID[gameId] ?? (artKind ? GAME_ART_BY_KIND[artKind] : undefined)
}

export function resolveGameArtImage(
  gameId: string,
  artKind?: string,
  size: GameArtSize = 'full',
): string | undefined {
  const pair = resolveArtPair(gameId, artKind)
  if (!pair) return undefined
  return size === 'thumb' ? pair.thumb : pair.full
}

export function hasGameCover(gameId: string, artKind?: string): boolean {
  return Boolean(resolveArtPair(gameId, artKind))
}

export function gameCoverStyle(
  gameId: string,
  artKind?: string,
  size: GameArtSize = 'thumb',
): CSSProperties | undefined {
  const image = resolveGameArtImage(gameId, artKind, size)
  if (!image) return undefined
  return { '--pm-game-art-image': `url(${image})` } as CSSProperties
}

export function mergeGameCoverStyle(
  gameId: string,
  artKind?: string,
  extra?: CSSProperties,
  size: GameArtSize = 'thumb',
): CSSProperties | undefined {
  const cover = gameCoverStyle(gameId, artKind, size)
  if (!cover && !extra) return undefined
  return { ...extra, ...cover }
}
