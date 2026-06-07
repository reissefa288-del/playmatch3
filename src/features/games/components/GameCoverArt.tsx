import type { CSSProperties, ReactNode } from 'react'
import { hasGameCover, mergeGameCoverStyle } from '../gameArtImages'

type GameCoverArtProps = {
  gameId: string
  artKind?: string
  className: string
  style?: CSSProperties
  children: ReactNode
  hidden?: boolean
}

export function GameCoverArt({ gameId, artKind, className, style, children, hidden }: GameCoverArtProps) {
  const coverClass = hasGameCover(gameId, artKind) ? ' has-game-cover' : ''

  return (
    <div
      className={`${className}${coverClass}`}
      style={mergeGameCoverStyle(gameId, artKind, style)}
      aria-hidden={hidden ?? true}
    >
      {children}
    </div>
  )
}
