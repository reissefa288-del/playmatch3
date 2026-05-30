import {
  enemyGlyph,
  isInSlug,
  platformSegmentsForRender,
  type HorizDir,
  type MetalSlugSideState,
} from '../utils/metalSlugDuelEngine'

type Props = {
  p1: MetalSlugSideState
  p2: MetalSlugSideState
  now: number
  disabled?: boolean
  onMove: (dir: HorizDir) => void
  onJump: () => void
  onFire: () => void
  onGrenade: () => void
}

function MetalSlugScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onJump,
  onFire,
  onGrenade,
}: {
  side: MetalSlugSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: HorizDir) => void
  onJump?: () => void
  onFire?: () => void
  onGrenade?: () => void
}) {
  const invuln = now < side.invulnUntil
  const slug = isInSlug(side, now)
  const platforms = platformSegmentsForRender()

  return (
    <div
      className={[
        'pm-ms-screen',
        `is-${accent}`,
        slug ? 'is-slug' : '',
        interactive ? 'is-you' : 'is-rival',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="pm-ms-screen__label">{label}</p>
      {slug ? <p className="pm-ms-screen__slug-badge">SLUG</p> : null}
      <div className="pm-ms-screen__track" role="presentation">
        <div className="pm-ms-screen__sky" aria-hidden />
        <div className="pm-ms-screen__ruins" aria-hidden />

        {platforms.map((p, i) => (
          <span
            key={i}
            className="pm-ms-screen__platform"
            style={{ top: `${p.y}%`, left: `${p.xMin}%`, width: `${p.xMax - p.xMin}%` }}
            aria-hidden
          />
        ))}

        {side.pickups.map((p) => (
          <span
            key={p.id}
            className="pm-ms-screen__pickup"
            style={{ left: `${p.x}%`, top: `${p.y - 10}%` }}
            aria-hidden
          >
            SV-001
          </span>
        ))}

        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-ms-screen__enemy', `is-${e.kind}`].join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y - 6}%` }}
            aria-hidden
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}

        {side.bullets.map((b) => (
          <span
            key={b.id}
            className={['pm-ms-screen__bullet', b.fromPlayer ? 'is-player' : 'is-enemy', b.heavy ? 'is-heavy' : '']
              .filter(Boolean)
              .join(' ')}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            aria-hidden
          />
        ))}

        {side.grenades.map((g) => (
          <span
            key={g.id}
            className="pm-ms-screen__grenade"
            style={{ left: `${g.x}%`, top: `${g.y}%` }}
            aria-hidden
          />
        ))}

        {side.lives > 0 ? (
          <span
            className={['pm-ms-screen__hero', slug ? 'is-slug' : '', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${side.px}%`, top: `${side.py - (slug ? 10 : 6)}%` }}
            aria-hidden
          />
        ) : null}

        <div className="pm-ms-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-ms-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-ms-screen__controls">
          <div className="pm-ms-screen__steer" role="group" aria-label="Hareket">
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
          <button type="button" className="pm-ms-screen__fire" disabled={disabled} onClick={onFire}>
            ATEŞ
          </button>
          <button type="button" className="pm-ms-screen__grenade" disabled={disabled} onClick={onGrenade}>
            BOMBA
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function MetalSlugDuelArena({ p1, p2, now, disabled = false, onMove, onJump, onFire, onGrenade }: Props) {
  return (
    <div className="pm-ms-arena">
      <MetalSlugScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onJump={onJump}
        onFire={onFire}
        onGrenade={onGrenade}
      />
      <MetalSlugScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
