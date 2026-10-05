import '../../../styles/game-duel-video.css'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { DUEL_VIDEO_POSTER } from '../../../shared/duelVideoPoster'
import { loadDuelVideoSrc } from '../../../shared/loadDuelVideo'
import { SeamlessLoopVideo } from './SeamlessLoopVideo'

type GameDuelVideoBgProps = {
  className?: string
}

/** Statik poster — video indirmeden duel atmosferi */
export function GameDuelPosterBg({ className }: GameDuelVideoBgProps) {
  const rootClass = className
    ? `pm-duel-screen-video pm-duel-screen-video--poster ${className}`
    : 'pm-duel-screen-video pm-duel-screen-video--poster'

  return (
    <div
      className={rootClass}
      aria-hidden
      style={
        {
          backgroundImage: `url(${DUEL_VIDEO_POSTER})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } as CSSProperties
      }
    />
  )
}

/** Optimize edilmiş duel videosu — tüm duel oyun ekranlarında lazy yüklenir */
export function GameDuelVideoBg({ className }: GameDuelVideoBgProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const rootClass = className ? `pm-duel-screen-video ${className}` : 'pm-duel-screen-video'

  useEffect(() => {
    let cancelled = false
    loadDuelVideoSrc().then((src) => {
      if (!cancelled) setVideoSrc(src)
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
