import type { CSSProperties, ReactNode } from 'react'
import { hasGameCover, mergeGameCoverStyle } from '../gameArtImages'

type GameCoverArtProps = {
  gameId: string
  artKind?: string
  artSize?: 'full' | 'thumb'
  className: string
  style?: CSSProperties
  children: ReactNode
  hidden?: boolean
}

export function GameCoverArt({
  gameId,
  artKind,
  artSize = 'thumb',
  className,
  style,
  children,
  hidden,
}: GameCoverArtProps) {
  const coverClass = hasGameCover(gameId, artKind) ? ' has-game-cover' : ''

  return (
    <div
      className={`${className}${coverClass}`}
      style={mergeGameCoverStyle(gameId, artKind, style, artSize)}
      aria-hidden={hidden ?? true}
    >
      {children}
    </div>
  )
}
