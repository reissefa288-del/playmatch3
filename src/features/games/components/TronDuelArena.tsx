import { GRID_SIZE, type Direction, type TronSideState } from '../utils/tronDuelEngine'

type Props = {
  p1: TronSideState
  p2: TronSideState
  disabled?: boolean
  onTurn: (dir: Direction) => void
}

function TronGrid({
  side,
  label,
  accent,
  interactive,
  disabled,
  onTurn,
}: {
  side: TronSideState
  label: string
  accent: 'cyan' | 'pink'
  interactive: boolean
  disabled?: boolean
  onTurn?: (dir: Direction) => void
}) {
  const trailSet = new Set(side.trail)
  const head = side.trail[0]

  return (
    <div className={['pm-tr-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival', side.alive ? '' : 'is-dead'].filter(Boolean).join(' ')}>
      <p className="pm-tr-screen__label">{label}</p>
      <div className="pm-tr-screen__grid" role="presentation">
        {Array.from({ length: GRID_SIZE }, (_, index) => {
          const isHead = index === head
          const isTrail = trailSet.has(index) && !isHead
          return (
            <span
              key={index}
              className={['pm-tr-screen__cell', isHead ? 'is-head' : '', isTrail ? 'is-trail' : ''].filter(Boolean).join(' ')}
            />
          )
        })}
        <p className="pm-tr-screen__meta">
          İZ {side.maxTrail} · ✕{side.crashes}
        </p>
      </div>
      {interactive ? (
        <div className="pm-tr-screen__controls">
          <div className="pm-tr-screen__steer" role="group" aria-label="Yön">
            <button type="button" className="is-up" disabled={disabled} onClick={() => onTurn?.('up')} aria-label="Yukarı">
              ▲
            </button>
            <div className="pm-tr-screen__steer-mid">
              <button type="button" className="is-left" disabled={disabled} onClick={() => onTurn?.('left')} aria-label="Sol">
                ◀
              </button>
              <button type="button" className="is-right" disabled={disabled} onClick={() => onTurn?.('right')} aria-label="Sağ">
                ▶
              </button>
            </div>
            <button type="button" className="is-down" disabled={disabled} onClick={() => onTurn?.('down')} aria-label="Aşağı">
              ▼
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function TronDuelArena({ p1, p2, disabled = false, onTurn }: Props) {
  return (
    <div className="pm-tr-arena">
      <TronGrid side={p1} label="SEN" accent="cyan" interactive disabled={disabled} onTurn={onTurn} />
      <TronGrid side={p2} label="RAKİP" accent="pink" interactive={false} />
    </div>
  )
}
