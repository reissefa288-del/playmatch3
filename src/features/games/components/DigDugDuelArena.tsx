import { colToPct, COLS, enemyGlyph, rowToPct, type DigDugSideState, type Dir } from '../utils/digDugDuelEngine'

type Props = {
  p1: DigDugSideState
  p2: DigDugSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
  onPump: () => void
}

function DigDugScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onPump,
}: {
  side: DigDugSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
  onPump?: () => void
}) {
  const invuln = now < side.invulnUntil
  const dugCells = Array.from(side.dug)

  return (
    <div className={['pm-digdug-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-digdug-screen__label">{label}</p>
      <div className="pm-digdug-screen__track" role="presentation">
        <div className="pm-digdug-screen__soil" aria-hidden />
        {dugCells.map((k) => {
          const [c, r] = k.split(',').map(Number)
          return (
            <span
              key={k}
              className="pm-digdug-screen__tunnel"
              style={{ left: `${colToPct(c!)}%`, top: `${rowToPct(r!)}%` }}
              aria-hidden
            />
          )
        })}
        {side.rocks.map((rock) => (
          <span
            key={rock.id}
            className="pm-digdug-screen__rock"
            style={{ left: `${colToPct(rock.col)}%`, top: `${rowToPct(rock.row)}%` }}
            aria-hidden
          />
        ))}
        {side.veggieRow != null ? (
          <span
            className="pm-digdug-screen__veggie"
            style={{ left: `${colToPct(Math.floor(COLS / 2))}%`, top: `${rowToPct(side.veggieRow)}%` }}
            aria-hidden
          >
            🥕
          </span>
        ) : null}
        {side.enemies
          .filter((e) => e.alive)
          .map((e) => (
            <span
              key={e.id}
              className={['pm-digdug-screen__enemy', e.pump > 0 ? 'is-pumped' : '', `pump-${e.pump}`].filter(Boolean).join(' ')}
              style={{ left: `${colToPct(e.col)}%`, top: `${rowToPct(e.row)}%` }}
              aria-hidden
            >
              {enemyGlyph(e.kind)}
            </span>
          ))}
        {side.lives > 0 ? (
          <span
            className={['pm-digdug-screen__digger', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${colToPct(side.col)}%`, top: `${rowToPct(side.row)}%` }}
            aria-hidden
          >
            ⛏️
          </span>
        ) : null}
        <div className="pm-digdug-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-digdug-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-digdug-screen__controls">
          <div className="pm-digdug-screen__dpad" role="group" aria-label="Yön tuşları">
            <button type="button" className="is-up" disabled={disabled} onClick={() => onMove?.('up')} aria-label="Yukarı">
              ▲
            </button>
            <button type="button" className="is-left" disabled={disabled} onClick={() => onMove?.('left')} aria-label="Sol">
              ◀
            </button>
            <button type="button" className="is-down" disabled={disabled} onClick={() => onMove?.('down')} aria-label="Aşağı">
              ▼
            </button>
            <button type="button" className="is-right" disabled={disabled} onClick={() => onMove?.('right')} aria-label="Sağ">
              ▶
            </button>
          </div>
          <button type="button" className="pm-digdug-screen__pump" disabled={disabled} onClick={onPump}>
            POMPA
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function DigDugDuelArena({ p1, p2, now, disabled = false, onMove, onPump }: Props) {
  return (
    <div className="pm-digdug-arena">
      <DigDugScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onPump={onPump}
      />
      <DigDugScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
