import type { StackLaneEvent } from '../utils/stackDuelEngine'

type StackHitReactionProps = {
  event: StackLaneEvent
  accent: 'cyan' | 'pink'
}

export function StackHitReaction({ event, accent }: StackHitReactionProps) {
  if (event === 'over') return null

  return (
    <div
      className={`pm-stack-hit is-${accent} is-${event}`}
     
     
     
      aria-hidden
    >
      <span className="pm-stack-hit__flash" />
      <span className="pm-stack-hit__ring" />
      <span className="pm-stack-hit__burst" />
      <span className="pm-stack-hit__streak" />
      <span className="pm-stack-hit__shockwave" />
      {event === 'perfect' || event === 'good' ? (
        <span className="pm-stack-hit__sparks">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ ['--s' as string]: i }} />
          ))}
        </span>
      ) : null}
      {event === 'miss' ? <span className="pm-stack-hit__crack" /> : null}
    </div>
  )
}
