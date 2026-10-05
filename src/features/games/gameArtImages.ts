import type { CSSProperties } from 'react'
import type { PhotoSet } from '../../shared/photoPipeline'
import chessArtFull from '../../reference/opt/full/c1.webp'
import chessArtThumb from '../../reference/opt/thumb/c1.webp'
import chessArtFullAvif from '../../reference/opt/full/c1.avif'
import chessArtThumbAvif from '../../reference/opt/thumb/c1.avif'
import neonCrushArtFull from '../../reference/opt/full/3.webp'
import neonCrushArtThumb from '../../reference/opt/thumb/3.webp'
import neonCrushArtFullAvif from '../../reference/opt/full/3.avif'
import neonCrushArtThumbAvif from '../../reference/opt/thumb/3.avif'
import memoryUiArtFull from '../../reference/opt/full/2.webp'
import memoryUiArtThumb from '../../reference/opt/thumb/2.webp'
import memoryUiArtFullAvif from '../../reference/opt/full/2.avif'
import memoryUiArtThumbAvif from '../../reference/opt/thumb/2.avif'
import mineDuelArtFull from '../../reference/opt/full/5.webp'
import mineDuelArtThumb from '../../reference/opt/thumb/5.webp'
import mineDuelArtFullAvif from '../../reference/opt/full/5.avif'
import mineDuelArtThumbAvif from '../../reference/opt/thumb/5.avif'
import blockArtFull from '../../reference/opt/full/block.webp'
import blockArtThumb from '../../reference/opt/thumb/block.webp'
import blockArtFullAvif from '../../reference/opt/full/block.avif'
import blockArtThumbAvif from '../../reference/opt/thumb/block.avif'
import brickArtFull from '../../reference/opt/full/brick.webp'
import brickArtThumb from '../../reference/opt/thumb/brick.webp'
import brickArtFullAvif from '../../reference/opt/full/brick.avif'
import brickArtThumbAvif from '../../reference/opt/thumb/brick.avif'

import bubbleArtFull from '../../reference/opt/full/bubble.webp'
import bubbleArtThumb from '../../reference/opt/thumb/bubble.webp'
import bubbleArtFullAvif from '../../reference/opt/full/bubble.avif'
import bubbleArtThumbAvif from '../../reference/opt/thumb/bubble.avif'
import colorMatchCoverFull from '../../reference/opt/full/color-match-duel.webp'
import colorMatchCoverThumb from '../../reference/opt/thumb/color-match-duel.webp'
import colorMatchCoverFullAvif from '../../reference/opt/full/color-match-duel.avif'
import colorMatchCoverThumbAvif from '../../reference/opt/thumb/color-match-duel.avif'
import pongDuelCoverFull from '../../reference/opt/full/pong-duel.webp'
import pongDuelCoverThumb from '../../reference/opt/thumb/pong-duel.webp'
import pongDuelCoverFullAvif from '../../reference/opt/full/pong-duel.avif'
import pongDuelCoverThumbAvif from '../../reference/opt/thumb/pong-duel.avif'
import simonDuelCoverFull from '../../reference/opt/full/simon-duel.webp'
import simonDuelCoverThumb from '../../reference/opt/thumb/simon-duel.webp'
import simonDuelCoverFullAvif from '../../reference/opt/full/simon-duel.avif'
import simonDuelCoverThumbAvif from '../../reference/opt/thumb/simon-duel.avif'
import snakeDuelCoverFull from '../../reference/opt/full/snake-duel.webp'
import snakeDuelCoverThumb from '../../reference/opt/thumb/snake-duel.webp'
import snakeDuelCoverFullAvif from '../../reference/opt/full/snake-duel.avif'
import snakeDuelCoverThumbAvif from '../../reference/opt/thumb/snake-duel.avif'
import galaxyArtFull from '../../reference/opt/full/galaxy.webp'
import galaxyArtThumb from '../../reference/opt/thumb/galaxy.webp'
import galaxyArtFullAvif from '../../reference/opt/full/galaxy.avif'
import galaxyArtThumbAvif from '../../reference/opt/thumb/galaxy.avif'
import mathArtFull from '../../reference/opt/full/math.webp'
import mathArtThumb from '../../reference/opt/thumb/math.webp'
import mathArtFullAvif from '../../reference/opt/full/math.avif'
import mathArtThumbAvif from '../../reference/opt/thumb/math.avif'
import memoryArtFull from '../../reference/opt/full/memory.webp'
import memoryArtThumb from '../../reference/opt/thumb/memory.webp'
import memoryArtFullAvif from '../../reference/opt/full/memory.avif'
import memoryArtThumbAvif from '../../reference/opt/thumb/memory.avif'
import gemMatchArtFull from '../../reference/opt/full/mor.webp'
import gemMatchArtThumb from '../../reference/opt/thumb/mor.webp'
import gemMatchArtFullAvif from '../../reference/opt/full/mor.avif'
import gemMatchArtThumbAvif from '../../reference/opt/thumb/mor.avif'
import stackArtFull from '../../reference/opt/full/stack.webp'
import stackArtThumb from '../../reference/opt/thumb/stack.webp'
import stackArtFullAvif from '../../reference/opt/full/stack.avif'
import stackArtThumbAvif from '../../reference/opt/thumb/stack.avif'
import vsArtFull from '../../reference/opt/full/vs.webp'
import vsArtThumb from '../../reference/opt/thumb/vs.webp'
import vsArtFullAvif from '../../reference/opt/full/vs.avif'
import vsArtThumbAvif from '../../reference/opt/thumb/vs.avif'
import xoxArtFull from '../../reference/opt/full/xox.webp'
import xoxArtThumb from '../../reference/opt/thumb/xox.webp'
import xoxArtFullAvif from '../../reference/opt/full/xox.avif'
import xoxArtThumbAvif from '../../reference/opt/thumb/xox.avif'

export type GameArtSize = 'full' | 'thumb'

type ArtPair = { full: string; thumb: string; fullAvif?: string; thumbAvif?: string }

function pair(full: string, thumb: string, fullAvif?: string, thumbAvif?: string): ArtPair {
  return { full, thumb, fullAvif, thumbAvif }
}

const GAME_ART_BY_KIND: Record<string, ArtPair> = {
  'bubble-shooter': pair(bubbleArtFull, bubbleArtThumb, bubbleArtFullAvif, bubbleArtThumbAvif),
  'brick-break': pair(brickArtFull, brickArtThumb, brickArtFullAvif, brickArtThumbAvif),
  'block-duel': pair(blockArtFull, blockArtThumb, blockArtFullAvif, blockArtThumbAvif),
  xox: pair(xoxArtFull, xoxArtThumb, xoxArtFullAvif, xoxArtThumbAvif),
  memory: pair(memoryArtFull, memoryArtThumb, memoryArtFullAvif, memoryArtThumbAvif),
  stack: pair(stackArtFull, stackArtThumb, stackArtFullAvif, stackArtThumbAvif),
  math: pair(mathArtFull, mathArtThumb, mathArtFullAvif, mathArtThumbAvif),
  'math-duel': pair(mathArtFull, mathArtThumb, mathArtFullAvif, mathArtThumbAvif),
  'color-match': pair(colorMatchCoverFull, colorMatchCoverThumb, colorMatchCoverFullAvif, colorMatchCoverThumbAvif),
  'neon-crush': pair(neonCrushArtFull, neonCrushArtThumb, neonCrushArtFullAvif, neonCrushArtThumbAvif),
  snake: pair(snakeDuelCoverFull, snakeDuelCoverThumb, snakeDuelCoverFullAvif, snakeDuelCoverThumbAvif),
  'snake-duel': pair(snakeDuelCoverFull, snakeDuelCoverThumb, snakeDuelCoverFullAvif, snakeDuelCoverThumbAvif),
  pong: pair(pongDuelCoverFull, pongDuelCoverThumb, pongDuelCoverFullAvif, pongDuelCoverThumbAvif),
  'pong-duel': pair(pongDuelCoverFull, pongDuelCoverThumb, pongDuelCoverFullAvif, pongDuelCoverThumbAvif),
  'simon-duel': pair(simonDuelCoverFull, simonDuelCoverThumb, simonDuelCoverFullAvif, simonDuelCoverThumbAvif),
  'slice-duel': pair(memoryUiArtFull, memoryUiArtThumb, memoryUiArtFullAvif, memoryUiArtThumbAvif),
  'chess-duel': pair(chessArtFull, chessArtThumb, chessArtFullAvif, chessArtThumbAvif),
  'space-duel': pair(galaxyArtFull, galaxyArtThumb, galaxyArtFullAvif, galaxyArtThumbAvif),
  'missile-command-duel': pair(galaxyArtFull, galaxyArtThumb, galaxyArtFullAvif, galaxyArtThumbAvif),
  'defender-duel': pair(mineDuelArtFull, mineDuelArtThumb, mineDuelArtFullAvif, mineDuelArtThumbAvif),
  '1942-duel': pair(galaxyArtFull, galaxyArtThumb, galaxyArtFullAvif, galaxyArtThumbAvif),
  'word-arena': pair(memoryUiArtFull, memoryUiArtThumb, memoryUiArtFullAvif, memoryUiArtThumbAvif),
}

const GAME_ART_BY_ID: Record<string, ArtPair> = {
  'bubble-shooter-duel': pair(bubbleArtFull, bubbleArtThumb, bubbleArtFullAvif, bubbleArtThumbAvif),
  'brick-break-duel': pair(brickArtFull, brickArtThumb, brickArtFullAvif, brickArtThumbAvif),
  'block-duel': pair(blockArtFull, blockArtThumb, blockArtFullAvif, blockArtThumbAvif),
  xox: pair(xoxArtFull, xoxArtThumb, xoxArtFullAvif, xoxArtThumbAvif),
  'memory-duel': pair(memoryArtFull, memoryArtThumb, memoryArtFullAvif, memoryArtThumbAvif),
  'stack-duel': pair(stackArtFull, stackArtThumb, stackArtFullAvif, stackArtThumbAvif),
  'math-duel': pair(mathArtFull, mathArtThumb, mathArtFullAvif, mathArtThumbAvif),
  'color-match-duel': pair(colorMatchCoverFull, colorMatchCoverThumb, colorMatchCoverFullAvif, colorMatchCoverThumbAvif),
  'color-match': pair(colorMatchCoverFull, colorMatchCoverThumb, colorMatchCoverFullAvif, colorMatchCoverThumbAvif),
  'neon-crush-duel': pair(neonCrushArtFull, neonCrushArtThumb, neonCrushArtFullAvif, neonCrushArtThumbAvif),
  'snake-duel': pair(snakeDuelCoverFull, snakeDuelCoverThumb, snakeDuelCoverFullAvif, snakeDuelCoverThumbAvif),
  'pong-duel': pair(pongDuelCoverFull, pongDuelCoverThumb, pongDuelCoverFullAvif, pongDuelCoverThumbAvif),
  'simon-duel': pair(simonDuelCoverFull, simonDuelCoverThumb, simonDuelCoverFullAvif, simonDuelCoverThumbAvif),
  'slice-duel': pair(memoryUiArtFull, memoryUiArtThumb, memoryUiArtFullAvif, memoryUiArtThumbAvif),
  'chess-duel': pair(chessArtFull, chessArtThumb, chessArtFullAvif, chessArtThumbAvif),
  'space-duel': pair(galaxyArtFull, galaxyArtThumb, galaxyArtFullAvif, galaxyArtThumbAvif),
  'missile-command-duel': pair(galaxyArtFull, galaxyArtThumb, galaxyArtFullAvif, galaxyArtThumbAvif),
  'defender-duel': pair(mineDuelArtFull, mineDuelArtThumb, mineDuelArtFullAvif, mineDuelArtThumbAvif),
  '1942-duel': pair(galaxyArtFull, galaxyArtThumb, galaxyArtFullAvif, galaxyArtThumbAvif),
  'kelime-savasi': pair(memoryUiArtFull, memoryUiArtThumb, memoryUiArtFullAvif, memoryUiArtThumbAvif),
  'mini-satranc': pair(chessArtFull, chessArtThumb, chessArtFullAvif, chessArtThumbAvif),
  'hafiza-arena': pair(memoryArtFull, memoryArtThumb, memoryArtFullAvif, memoryArtThumbAvif),
  '8-top-duo': pair(vsArtFull, vsArtThumb, vsArtFullAvif, vsArtThumbAvif),
  'sayi-avcisi': pair(mathArtFull, mathArtThumb, mathArtFullAvif, mathArtThumbAvif),
  'kart-savasi': pair(gemMatchArtFull, gemMatchArtThumb, gemMatchArtFullAvif, gemMatchArtThumbAvif),
  'rank-yarisi': pair(vsArtFull, vsArtThumb, vsArtFullAvif, vsArtThumbAvif),
}

function resolveArtPair(gameId: string, artKind?: string): ArtPair | undefined {
  return GAME_ART_BY_ID[gameId] ?? (artKind ? GAME_ART_BY_KIND[artKind] : undefined)
}

function coverImageValue(pair: ArtPair, size: GameArtSize): string {
  const webp = size === 'thumb' ? pair.thumb : pair.full
  const avif = size === 'thumb' ? pair.thumbAvif : pair.fullAvif
  if (avif) {
    return `image-set(url('${avif}') type('image/avif'), url('${webp}') type('image/webp'))`
  }
  return `url(${webp})`
}

export function resolveGameArtImage(
  gameId: string,
  artKind?: string,
  size: GameArtSize = 'full',
): string | undefined {
  const art = resolveArtPair(gameId, artKind)
  if (!art) return undefined
  return size === 'thumb' ? art.thumb : art.full
}

export function hasGameCover(gameId: string, artKind?: string): boolean {
  return Boolean(resolveArtPair(gameId, artKind))
}

export function gameCoverStyle(
  gameId: string,
  artKind?: string,
  size: GameArtSize = 'thumb',
): CSSProperties | undefined {
  const art = resolveArtPair(gameId, artKind)
  if (!art) return undefined
  return { '--pm-game-art-image': coverImageValue(art, size) } as CSSProperties
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

export function gameArtSources(
  gameId: string,
  artKind?: string,
  size: GameArtSize = 'thumb',
): { webp: string; avif?: string } | undefined {
  const art = resolveArtPair(gameId, artKind)
  if (!art) return undefined
  const webp = size === 'thumb' ? art.thumb : art.full
  const avif = size === 'thumb' ? art.thumbAvif : art.fullAvif
  return { webp, avif }
}

/** P12 — thumb + full srcset for GameCoverArt / API swap later */
export function gameArtPhotoSet(gameId: string, artKind?: string): PhotoSet | undefined {
  const art = resolveArtPair(gameId, artKind)
  if (!art) return undefined
  return {
    thumb: { webp: art.thumb, avif: art.thumbAvif },
    full: { webp: art.full, avif: art.fullAvif },
  }
}

const COVER_OBJECT_TOP_KINDS = new Set([
  'color-match',
  'snake-duel',
  'snake',
  'pong-duel',
  'pong',
  'simon-duel',
])

/** Mini/featured kart `<img object-position>` — CSS background yerine img (P2) */
export function gameCoverObjectPosition(artKind?: string): string | undefined {
  if (!artKind) return undefined
  return COVER_OBJECT_TOP_KINDS.has(artKind) ? 'center top' : undefined
}

/** @deprecated P6 — use gamesLcpArt from ./gamesLcpArt (shell-only, no full art graph) */
export { gamesLcpArt as gamesLcpArtSources } from './gamesLcpArt'
