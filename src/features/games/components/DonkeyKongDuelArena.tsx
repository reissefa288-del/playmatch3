import {
  colToPct,
  GOAL_ROW,
  LADDER_COLS,
  PLATFORM_ROWS,
  rowToPct,
  type DonkeyKongSideState,
  type Dir,
} from '../utils/donkeyKongDuelEngine'

type Props = {
  p1: DonkeyKongSideState
  p2: DonkeyKongSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
  onJump: () => void
}

function DonkeyKongScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onJump,
}: {
  side: DonkeyKongSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
  onJump?: () => void
}) {
  const invuln = now < side.invulnUntil

  return (
    <div className={['pm-dk-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-dk-screen__label">{label}</p>
      <div className="pm-dk-screen__track" role="presentation">
        <span className="pm-dk-screen__dk" style={{ top: `${rowToPct(GOAL_ROW - 0.5)}%` }} aria-hidden>
          🦍
        </span>
        <span className="pm-dk-screen__goal" style={{ top: `${rowToPct(GOAL_ROW)}%` }} aria-hidden>
          👸
        </span>
        {[GOAL_ROW, ...PLATFORM_ROWS].map((row) => (
          <span key={row} className="pm-dk-screen__platform" style={{ top: `${rowToPct(row)}%` }} aria-hidden />
        ))}
        {LADDER_COLS.map((col) => (
          <span key={col} className="pm-dk-screen__ladder" style={{ left: `${colToPct(col)}%` }} aria-hidden />
        ))}
        {side.barrels.map((b) => (
          <span
            key={b.id}
            className={['pm-dk-screen__barrel', b.falling ? 'is-fall' : ''].filter(Boolean).join(' ')}
            style={{ left: `${colToPct(b.col)}%`, top: `${rowToPct(b.row)}%` }}
            aria-hidden
          />
        ))}
        {side.lives > 0 ? (
          <span
            className={['pm-dk-screen__mario', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${colToPct(side.col)}%`, top: `${rowToPct(side.row)}%` }}
            aria-hidden
          >
            🧢
          </span>
        ) : null}
        <div className="pm-dk-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-dk-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-dk-screen__controls">
          <div className="pm-dk-screen__dpad" role="group" aria-label="Hareket">
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
          <button type="button" className="pm-dk-screen__jump" disabled={disabled} onClick={onJump}>
            ZIPLA
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function DonkeyKongDuelArena({ p1, p2, now, disabled = false, onMove, onJump }: Props) {
  return (
    <div className="pm-dk-arena">
      <DonkeyKongScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onJump={onJump}
      />
      <DonkeyKongScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
