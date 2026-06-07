import type { CSSProperties } from 'react'
import chessArt from '../../reference/c1.png'
import neonCrushArt from '../../reference/3.jpeg'
import memoryUiArt from '../../reference/2.jpeg'
import mineDuelArt from '../../reference/5.png'
import blockArt from '../../reference/block.jpeg'
import brickArt from '../../reference/brick.png'
import bubbleArt from '../../reference/bubble.png'
import colorMatchCover from '../../reference/covers/color-match-duel.jpeg'
import pongDuelCover from '../../reference/covers/pong-duel.jpeg'
import simonDuelCover from '../../reference/covers/simon-duel.jpeg'
import snakeDuelCover from '../../reference/covers/snake-duel.jpeg'
import galaxyArt from '../../reference/galaxy.jpeg'
import mathArt from '../../reference/math.png'
import memoryArt from '../../reference/memory.jpeg'
import gemMatchArt from '../../reference/mor.png'
import stackArt from '../../reference/stack.png'
import vsArt from '../../reference/vs.png'
import xoxArt from '../../reference/xox.jpeg'

const GAME_ART_BY_KIND: Record<string, string> = {
  'bubble-shooter': bubbleArt,
  'brick-break': brickArt,
  'block-duel': blockArt,
  xox: xoxArt,
  memory: memoryArt,
  stack: stackArt,
  math: mathArt,
  'math-duel': mathArt,
  'color-match': colorMatchCover,
  'neon-crush': neonCrushArt,
  snake: snakeDuelCover,
  'snake-duel': snakeDuelCover,
  pong: pongDuelCover,
  'pong-duel': pongDuelCover,
  'simon-duel': simonDuelCover,
  'slice-duel': memoryUiArt,
  'chess-duel': chessArt,
  'space-duel': galaxyArt,
  'missile-command-duel': galaxyArt,
  'defender-duel': mineDuelArt,
  '1942-duel': galaxyArt,
  'word-arena': memoryUiArt,
}

const GAME_ART_BY_ID: Record<string, string> = {
  'bubble-shooter-duel': bubbleArt,
  'brick-break-duel': brickArt,
  'block-duel': blockArt,
  xox: xoxArt,
  'memory-duel': memoryArt,
  'stack-duel': stackArt,
  'math-duel': mathArt,
  'color-match-duel': colorMatchCover,
  'color-match': colorMatchCover,
  'neon-crush-duel': neonCrushArt,
  'snake-duel': snakeDuelCover,
  'pong-duel': pongDuelCover,
  'simon-duel': simonDuelCover,
  'slice-duel': memoryUiArt,
  'chess-duel': chessArt,
  'space-duel': galaxyArt,
  'missile-command-duel': galaxyArt,
  'defender-duel': mineDuelArt,
  '1942-duel': galaxyArt,
  'kelime-savasi': memoryUiArt,
  'mini-satranc': chessArt,
  'hafiza-arena': memoryArt,
  '8-top-duo': vsArt,
  'sayi-avcisi': mathArt,
  'kart-savasi': gemMatchArt,
  'rank-yarisi': vsArt,
}

export function resolveGameArtImage(gameId: string, artKind?: string): string | undefined {
  return GAME_ART_BY_ID[gameId] ?? (artKind ? GAME_ART_BY_KIND[artKind] : undefined)
}

export function hasGameCover(gameId: string, artKind?: string): boolean {
  return Boolean(resolveGameArtImage(gameId, artKind))
}

export function gameCoverStyle(gameId: string, artKind?: string): CSSProperties | undefined {
  const image = resolveGameArtImage(gameId, artKind)
  if (!image) return undefined
  return { '--pm-game-art-image': `url(${image})` } as CSSProperties
}

export function mergeGameCoverStyle(
  gameId: string,
  artKind?: string,
  extra?: CSSProperties,
): CSSProperties | undefined {
  const cover = gameCoverStyle(gameId, artKind)
  if (!cover && !extra) return undefined
  return { ...extra, ...cover }
}
