import {
  enemyGlyph,
  platformSegmentsForRender,
  type ContraSideState,
  type HorizDir,
} from '../utils/contraDuelEngine'

type Props = {
  p1: ContraSideState
  p2: ContraSideState
  now: number
  disabled?: boolean
  onMove: (dir: HorizDir) => void
  onJump: () => void
  onFire: () => void
}

function ContraScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onJump,
  onFire,
}: {
  side: ContraSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: HorizDir) => void
  onJump?: () => void
  onFire?: () => void
}) {
  const invuln = now < side.invulnUntil
  const platforms = platformSegmentsForRender()

  return (
    <div className={['pm-cx-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-cx-screen__label">{label}</p>
      <div className="pm-cx-screen__track" role="presentation">
        <div className="pm-cx-screen__sky" aria-hidden />
        <div className="pm-cx-screen__jungle" aria-hidden />

        {platforms.map((p, i) => (
          <span
            key={i}
            className="pm-cx-screen__platform"
            style={{ top: `${p.y}%`, left: `${p.xMin}%`, width: `${p.xMax - p.xMin}%` }}
            aria-hidden
          />
        ))}

        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-cx-screen__enemy', `is-${e.kind}`].join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y - 6}%` }}
            aria-hidden
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}

        {side.bullets.map((b) => (
          <span
            key={b.id}
            className={['pm-cx-screen__bullet', b.fromPlayer ? 'is-player' : 'is-enemy'].join(' ')}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            aria-hidden
          />
        ))}

        {side.lives > 0 ? (
          <span
            className={['pm-cx-screen__soldier', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${side.px}%`, top: `${side.py - 8}%` }}
            aria-hidden
          />
        ) : null}

        <div className="pm-cx-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-cx-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-cx-screen__controls">
          <div className="pm-cx-screen__steer" role="group" aria-label="Hareket">
            <button type="button" className="is-left" disabled={disabled} onClick={() => onMove?.('left')} aria-label="Sol">
              ◀
            </button>
            <button type="button" className="is-jump" disabled={disabled} onClick={onJump} aria-label="Zıpla">
              ▲
            </button>
            <button type="button" className="is-right" disabled={disabled} onClick={() => onMove?.('right')} aria-label="Sağ">
              ▶
            </button>
          </div>
          <button type="button" className="pm-cx-screen__fire" disabled={disabled} onClick={onFire}>
            ATEŞ
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function ContraDuelArena({ p1, p2, now, disabled = false, onMove, onJump, onFire }: Props) {
  return (
    <div className="pm-cx-arena">
      <ContraScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onJump={onJump}
        onFire={onFire}
      />
      <ContraScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
