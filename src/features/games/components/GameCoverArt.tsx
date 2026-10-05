import type { CSSProperties, ReactNode } from 'react'
import { PhotoImage } from '../../../shared/PhotoImage'
import { gameArtPhotoSet, gameCoverObjectPosition, hasGameCover } from '../gameArtImages'

type GameCoverArtProps = {
  gameId: string
  artKind?: string
  artSize?: 'full' | 'thumb'
  className: string
  style?: CSSProperties
  children: ReactNode
  hidden?: boolean
  /** fetchPriority=high — yalnızca route LCP adayları (hero); kartlarda kullanma */
  priority?: boolean
  /** loading=eager — viewport'a yakın kartlar için */
  eager?: boolean
  /** fetchPriority=low — body kartları hero LCP ile yarışmasın */
  lowPriority?: boolean
}

export function GameCoverArt({
  gameId,
  artKind,
  artSize = 'thumb',
  className,
  style,
  children,
  hidden,
  priority = false,
  eager = false,
  lowPriority = false,
}: GameCoverArtProps) {
  const hasCover = hasGameCover(gameId, artKind)
  const photo = hasCover ? gameArtPhotoSet(gameId, artKind) : undefined
  const coverClass = hasCover ? ' has-game-cover has-game-cover--img' : ''
  const objectPosition = gameCoverObjectPosition(artKind)
  const sizes = artSize === 'full' ? '960px' : '(max-width: 480px) 480px, 960px'

  return (
    <div
      className={`${className}${coverClass}`}
      style={style}
      aria-hidden={hidden ?? true}
    >
      {photo ? (
        <PhotoImage
          photo={photo}
          alt=""
          className="pm-game-cover-art__img"
          sizes={sizes}
          priority={priority}
          eager={eager}
          fetchPriority={lowPriority ? 'low' : undefined}
          style={objectPosition ? { objectPosition } : undefined}
        />
      ) : null}
      {children}
    </div>
  )
}
