import duelVideo from '../../../reference/video.mp4'
import { SeamlessLoopVideo } from './SeamlessLoopVideo'

type GameDuelVideoBgProps = {
  className?: string
}

/** Paylaşılan video.mp4 arka planı — Bubble · Brick · Block · XOX · Memory */
export function GameDuelVideoBg({ className }: GameDuelVideoBgProps) {
  const rootClass = className ? `pm-duel-screen-video ${className}` : 'pm-duel-screen-video'

  return (
    <div className={rootClass} aria-hidden>
      <SeamlessLoopVideo className="pm-duel-screen-video__loop" src={duelVideo} crossfadeSec={0.52} />
      <span className="pm-duel-screen-video__wash is-p1" />
      <span className="pm-duel-screen-video__wash is-p2" />
      <span className="pm-duel-screen-video__feather" />
      <span className="pm-duel-screen-video__grade" />
    </div>
  )
}
