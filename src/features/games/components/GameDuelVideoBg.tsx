import '../../../styles/game-duel-video.css'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { DUEL_VIDEO_POSTER } from '../../../shared/duelVideoPoster'
import { SeamlessLoopVideo } from './SeamlessLoopVideo'

type GameDuelVideoBgProps = {
  className?: string
}

/** Paylaşılan video.mp4 arka planı — lazy-loaded to keep initial bundles small. */
export function GameDuelVideoBg({ className }: GameDuelVideoBgProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const rootClass = className ? `pm-duel-screen-video ${className}` : 'pm-duel-screen-video'

  useEffect(() => {
    let cancelled = false
    import('../../../reference/video.mp4').then((mod) => {
      if (!cancelled) setVideoSrc(mod.default)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      className={rootClass}
      aria-hidden
      style={
        !videoSrc
          ? ({
              backgroundImage: `url(${DUEL_VIDEO_POSTER})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } as CSSProperties)
          : undefined
      }
    >
      {videoSrc ? (
        <>
          <SeamlessLoopVideo className="pm-duel-screen-video__loop" src={videoSrc} crossfadeSec={0.52} />
          <span className="pm-duel-screen-video__wash is-p1" />
          <span className="pm-duel-screen-video__wash is-p2" />
          <span className="pm-duel-screen-video__feather" />
          <span className="pm-duel-screen-video__grade" />
        </>
      ) : null}
    </div>
  )
}
