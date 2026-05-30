import {
  cubeIndex,
  cubesDoneCount,
  CUBE_COUNT,
  PYRAMID_ROWS,
  type HopDir,
  type QbertSideState,
} from '../utils/qbertDuelEngine'

type Props = {
  p1: QbertSideState
  p2: QbertSideState
  now: number
  disabled?: boolean
  onHop: (dir: HopDir) => void
}

function QbertScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onHop,
}: {
  side: QbertSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onHop?: (dir: HopDir) => void
}) {
  const invuln = now < side.invulnUntil
  const done = cubesDoneCount(side.cubes)

  return (
    <div className={['pm-qb-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-qb-screen__label">{label}</p>
      <div className="pm-qb-screen__pyramid" role="presentation">
        {Array.from({ length: PYRAMID_ROWS }, (_, row) => (
          <div key={row} className="pm-qb-screen__row">
            {Array.from({ length: row + 1 }, (_, col) => {
              const i = cubeIndex(row, col)
              const state = side.cubes[i] ?? 0
              const isPlayer = side.lives > 0 && side.row === row && side.col === col
              const isCoily = side.coilyRow === row && side.coilyCol === col
              return (
                <span
                  key={col}
                  className={[
                    'pm-qb-screen__cube',
                    state === 1 ? 'is-half' : '',
                    state >= 2 ? 'is-done' : '',
                    isPlayer ? 'has-qbert' : '',
                    isCoily ? 'has-coily' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {isCoily && !isPlayer ? <span className="pm-qb-screen__coily" aria-hidden /> : null}
                  {isPlayer ? (
                    <span
                      className={['pm-qb-screen__qbert', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
                      aria-hidden
                    />
                  ) : null}
                </span>
              )
            })}
          </div>
        ))}
        <div className="pm-qb-screen__progress" aria-label={`${done} / ${CUBE_COUNT} kare`}>
          {done}/{CUBE_COUNT}
        </div>
      </div>
      {interactive ? (
        <div className="pm-qb-screen__controls" role="group" aria-label="Zıpla">
          <button type="button" className="is-ul" disabled={disabled} onClick={() => onHop?.('ul')} aria-label="Sol üst">
            ◤
          </button>
          <button type="button" className="is-ur" disabled={disabled} onClick={() => onHop?.('ur')} aria-label="Sağ üst">
            ◥
          </button>
          <button type="button" className="is-dl" disabled={disabled} onClick={() => onHop?.('dl')} aria-label="Sol alt">
            ◣
          </button>
          <button type="button" className="is-dr" disabled={disabled} onClick={() => onHop?.('dr')} aria-label="Sağ alt">
            ◢
          </button>
        </div>
      ) : null}
      <div className="pm-qb-screen__lives" aria-label={`${side.lives} can`}>
        {Array.from({ length: side.lives }, (_, i) => (
          <span key={i} className="pm-qb-screen__life" />
        ))}
      </div>
    </div>
  )
}

export function QbertDuelArena({ p1, p2, now, disabled = false, onHop }: Props) {
  return (
    <div className="pm-qb-arena">
      <QbertScreen side={p1} label="SEN" accent="cyan" now={now} interactive disabled={disabled} onHop={onHop} />
      <QbertScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
