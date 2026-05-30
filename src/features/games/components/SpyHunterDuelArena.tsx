import {
  colToPct,
  COLS,
  enemyGlyph,
  playerWorldY,
  worldToPct,
  type Dir,
  type SpyHunterSideState,
} from '../utils/spyHunterDuelEngine'

type Props = {
  p1: SpyHunterSideState
  p2: SpyHunterSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
  onFire: () => void
}

function SpyHunterScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onFire,
}: {
  side: SpyHunterSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
  onFire?: () => void
}) {
  const invuln = now < side.invulnUntil
  const scroll = side.scroll
  const playerY = worldToPct(playerWorldY(scroll), scroll)

  return (
    <div className={['pm-sh-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-sh-screen__label">{label}</p>
      <div className="pm-sh-screen__track" role="presentation">
        <div className="pm-sh-screen__road" aria-hidden />
        {Array.from({ length: COLS - 1 }, (_, i) => (
          <span
            key={i}
            className="pm-sh-screen__lane-line"
            style={{ left: `${((i + 1) / COLS) * 100}%` }}
            aria-hidden
          />
        ))}

        {side.hazards.map((h) => {
          const top = worldToPct(h.worldY, scroll)
          if (top < 4 || top > 94) return null
          return (
            <span
              key={h.id}
              className="pm-sh-screen__hazard"
              style={{ left: `${colToPct(h.col)}%`, top: `${top}%` }}
              aria-hidden
            />
          )
        })}

        {side.enemies.map((e) => {
          const top = worldToPct(e.worldY, scroll)
          if (top < 4 || top > 94) return null
          return (
            <span
              key={e.id}
              className={['pm-sh-screen__enemy', `is-${e.kind}`, e.hp < 2 ? 'is-hit' : ''].filter(Boolean).join(' ')}
              style={{ left: `${colToPct(e.col)}%`, top: `${top}%` }}
              aria-hidden
            >
              {enemyGlyph(e.kind)}
            </span>
          )
        })}

        {side.bullets.map((b) => {
          const top = worldToPct(b.worldY, scroll)
          if (top < 2 || top > 98) return null
          return (
            <span
              key={b.id}
              className="pm-sh-screen__bullet"
              style={{ left: `${colToPct(b.col)}%`, top: `${top}%` }}
              aria-hidden
            />
          )
        })}

        {side.lives > 0 ? (
          <span
            className={['pm-sh-screen__car', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${colToPct(side.playerCol)}%`, top: `${playerY}%` }}
            aria-hidden
          />
        ) : null}

        <div className="pm-sh-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-sh-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-sh-screen__controls">
          <div className="pm-sh-screen__steer" role="group" aria-label="Direksiyon">
            <button type="button" className="is-left" disabled={disabled} onClick={() => onMove?.('left')} aria-label="Sol">
              ◀
            </button>
            <button type="button" className="is-right" disabled={disabled} onClick={() => onMove?.('right')} aria-label="Sağ">
              ▶
            </button>
          </div>
          <button type="button" className="pm-sh-screen__fire" disabled={disabled} onClick={onFire}>
            ATEŞ
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function SpyHunterDuelArena({ p1, p2, now, disabled = false, onMove, onFire }: Props) {
  return (
    <div className="pm-sh-arena">
      <SpyHunterScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onFire={onFire}
      />
      <SpyHunterScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
