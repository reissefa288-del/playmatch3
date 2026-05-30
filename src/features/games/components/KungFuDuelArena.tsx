import {
  attackGlyph,
  hpPct,
  type BlockKind,
  type KungFuSideState,
  type StrikeKind,
} from '../utils/kungFuDuelEngine'

type Props = {
  p1: KungFuSideState
  p2: KungFuSideState
  disabled?: boolean
  onBlock: (block: BlockKind) => void
  onStrike: (strike: StrikeKind) => void
}

function KungFuScreen({
  side,
  label,
  accent,
  interactive,
  disabled,
  onBlock,
  onStrike,
}: {
  side: KungFuSideState
  label: string
  accent: 'cyan' | 'pink'
  interactive: boolean
  disabled?: boolean
  onBlock?: (block: BlockKind) => void
  onStrike?: (strike: StrikeKind) => void
}) {
  const canBlock = side.phase === 'attack' || side.phase === 'telegraph'
  const canStrike = side.phase === 'opening'

  return (
    <div
      className={['pm-kf-screen', `is-${accent}`, `is-${side.phase}`, interactive ? 'is-you' : 'is-rival']
        .filter(Boolean)
        .join(' ')}
    >
      <p className="pm-kf-screen__label">{label}</p>
      <div className="pm-kf-screen__dojo" role="presentation">
        <div className="pm-kf-screen__floor" aria-hidden />
        <div className="pm-kf-screen__banner" aria-hidden />

        <div className="pm-kf-screen__foe" aria-hidden>
          <span className={['pm-kf-screen__foe-body', side.phase === 'attack' ? 'is-strike' : ''].filter(Boolean).join(' ')} />
          {side.attackKind && (side.phase === 'telegraph' || side.phase === 'attack') ? (
            <span className={`pm-kf-screen__sigil is-${side.attackKind}`}>{attackGlyph(side.attackKind)}</span>
          ) : null}
        </div>

        <span
          className={['pm-kf-screen__fighter', side.lastStrikeKind ? `is-${side.lastStrikeKind}` : ''].filter(Boolean).join(' ')}
          aria-hidden
        />

        {side.flashMessage ? <p className="pm-kf-screen__flash">{side.flashMessage}</p> : null}
        {side.combos > 1 ? <p className="pm-kf-screen__combo">COMBO x{side.combos}</p> : null}

        <div className="pm-kf-screen__bars">
          <div className="pm-kf-screen__bar is-you">
            <span>KI</span>
            <i><b style={{ width: `${hpPct(side.playerHp)}%` }} /></i>
          </div>
          <div className="pm-kf-screen__bar is-opp">
            <span>RAKİP</span>
            <i><b style={{ width: `${hpPct(side.opponentHp)}%` }} /></i>
          </div>
        </div>
      </div>
      {interactive ? (
        <div className="pm-kf-screen__controls">
          <div className="pm-kf-screen__blocks" role="group" aria-label="Blok">
            <button type="button" disabled={disabled || !canBlock} onClick={() => onBlock?.('high')} aria-label="Üst blok">
              ↑
            </button>
            <button type="button" disabled={disabled || !canBlock} onClick={() => onBlock?.('low')} aria-label="Alt blok">
              ↓
            </button>
            <button type="button" disabled={disabled || !canBlock} onClick={() => onBlock?.('back')} aria-label="Geri kaç">
              ←
            </button>
          </div>
          <div className="pm-kf-screen__strikes" role="group" aria-label="Vuruş">
            <button type="button" disabled={disabled || !canStrike} onClick={() => onStrike?.('punch')}>
              YUMRUK
            </button>
            <button type="button" disabled={disabled || !canStrike} onClick={() => onStrike?.('kick')}>
              TEKME
            </button>
            <button type="button" disabled={disabled || !canStrike} onClick={() => onStrike?.('palm')}>
              AVUÇ
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function KungFuDuelArena({ p1, p2, disabled = false, onBlock, onStrike }: Props) {
  return (
    <div className="pm-kf-arena">
      <KungFuScreen
        side={p1}
        label="SEN"
        accent="cyan"
        interactive
        disabled={disabled}
        onBlock={onBlock}
        onStrike={onStrike}
      />
      <KungFuScreen side={p2} label="RAKİP" accent="pink" interactive={false} />
    </div>
  )
}
