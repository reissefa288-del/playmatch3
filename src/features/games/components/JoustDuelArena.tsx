import { enemyGlyph, PLATFORMS, type HorizDir, type JoustSideState } from '../utils/joustDuelEngine'

type Props = {
  p1: JoustSideState
  p2: JoustSideState
  now: number
  disabled?: boolean
  onMove: (dir: HorizDir) => void
  onFlap: () => void
}

function JoustScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onFlap,
}: {
  side: JoustSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: HorizDir) => void
  onFlap?: () => void
}) {
  const invuln = now < side.invulnUntil

  return (
    <div className={['pm-joust-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-joust-screen__label">{label}</p>
      <div className="pm-joust-screen__track" role="presentation">
        <div className="pm-joust-screen__lava" aria-hidden />
        {PLATFORMS.map((p) => (
          <span
            key={p.id}
            className="pm-joust-screen__platform"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%` }}
            aria-hidden
          />
        ))}
        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-joust-screen__enemy', `is-${e.kind}`].join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
            aria-hidden
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}
        {side.lives > 0 ? (
          <span
            className={[
              'pm-joust-screen__rider',
              side.facing === 'left' ? 'is-left' : 'is-right',
              invuln ? 'is-invuln' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ left: `${side.px}%`, top: `${side.py}%` }}
            aria-hidden
          >
            🦤
          </span>
        ) : null}
        <div className="pm-joust-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-joust-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-joust-screen__controls">
          <button type="button" className="is-left" disabled={disabled} onClick={() => onMove?.('left')} aria-label="Sol">
            ◀
          </button>
          <button type="button" className="pm-joust-screen__flap" disabled={disabled} onClick={onFlap}>
            ÇIRP
          </button>
          <button type="button" className="is-right" disabled={disabled} onClick={() => onMove?.('right')} aria-label="Sağ">
            ▶
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function JoustDuelArena({ p1, p2, now, disabled = false, onMove, onFlap }: Props) {
  return (
    <div className="pm-joust-arena">
      <JoustScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onFlap={onFlap}
      />
      <JoustScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
