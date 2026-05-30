import {
  colToPct,
  playerWorldY,
  worldToPct,
  type Dir,
  type PaperboySideState,
} from '../utils/paperboyDuelEngine'

type Props = {
  p1: PaperboySideState
  p2: PaperboySideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
  onThrow: () => void
}

function PaperboyScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onThrow,
}: {
  side: PaperboySideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
  onThrow?: () => void
}) {
  const invuln = now < side.invulnUntil
  const scroll = side.scroll
  const playerY = worldToPct(playerWorldY(scroll), scroll)

  return (
    <div className={['pm-pb-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-pb-screen__label">{label}</p>
      <div className="pm-pb-screen__track" role="presentation">
        <div className="pm-pb-screen__lane is-sidewalk-left" aria-hidden />
        <div className="pm-pb-screen__lane is-road" aria-hidden />
        <div className="pm-pb-screen__lane is-sidewalk-right" aria-hidden />

        {side.houses.map((h) => {
          const top = worldToPct(h.worldY, scroll)
          if (top < 4 || top > 96) return null
          return (
            <span
              key={h.id}
              className={['pm-pb-screen__house', h.delivered ? 'is-delivered' : ''].filter(Boolean).join(' ')}
              style={{ left: `${colToPct(h.col)}%`, top: `${top}%` }}
              aria-hidden
            >
              <span className="pm-pb-screen__mailbox" />
            </span>
          )
        })}

        {side.obstacles.map((o) => {
          const top = worldToPct(o.worldY, scroll)
          if (top < 4 || top > 96) return null
          return (
            <span
              key={o.id}
              className={['pm-pb-screen__obstacle', `is-${o.kind}`].join(' ')}
              style={{ left: `${colToPct(o.col)}%`, top: `${top}%` }}
              aria-hidden
            />
          )
        })}

        {side.papers.map((p) => {
          const top = worldToPct(p.worldY, scroll)
          if (top < 2 || top > 98) return null
          return (
            <span
              key={p.id}
              className="pm-pb-screen__paper"
              style={{ left: `${colToPct(p.col)}%`, top: `${top}%` }}
              aria-hidden
            />
          )
        })}

        {side.lives > 0 ? (
          <span
            className={['pm-pb-screen__bike', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${colToPct(side.playerCol)}%`, top: `${playerY}%` }}
            aria-hidden
          />
        ) : null}

        <div className="pm-pb-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-pb-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-pb-screen__controls">
          <div className="pm-pb-screen__steer" role="group" aria-label="Gidon">
            <button type="button" className="is-left" disabled={disabled} onClick={() => onMove?.('left')} aria-label="Sol">
              ◀
            </button>
            <button type="button" className="is-right" disabled={disabled} onClick={() => onMove?.('right')} aria-label="Sağ">
              ▶
            </button>
          </div>
          <button type="button" className="pm-pb-screen__throw" disabled={disabled} onClick={onThrow}>
            GAZETE
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function PaperboyDuelArena({ p1, p2, now, disabled = false, onMove, onThrow }: Props) {
  return (
    <div className="pm-pb-arena">
      <PaperboyScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onThrow={onThrow}
      />
      <PaperboyScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
