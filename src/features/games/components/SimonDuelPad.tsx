import type { PadId, SimonPhase } from '../utils/simonDuelEngine'

const PAD_LABELS = ['KIRMIZI', 'MAVİ', 'YEŞİL', 'SARI'] as const

type Props = {
  phase: SimonPhase
  highlightPad: PadId | null
  disabled?: boolean
  onTap: (pad: PadId) => void
}

export function SimonDuelPad({ phase, highlightPad, disabled = false, onTap }: Props) {
  const canInput = phase === 'input' && !disabled

  return (
    <div
      className={['pm-simon-pad', `is-${phase}`, disabled ? 'is-disabled' : ''].filter(Boolean).join(' ')}
      role="group"
      aria-label="Simon padleri"
    >
      {([0, 1, 2, 3] as PadId[]).map((pad) => {
        const lit = highlightPad === pad && (phase === 'show' || phase === 'input' || phase === 'break')
        return (
          <button
            key={pad}
            type="button"
            className={['pm-simon-pad__btn', `is-pad-${pad}`, lit ? 'is-lit' : ''].filter(Boolean).join(' ')}
            disabled={!canInput}
            onClick={() => onTap(pad)}
            aria-label={PAD_LABELS[pad]}
          />
        )
      })}
      <p className="pm-simon-pad__hint">
        {phase === 'show' ? 'DESENİ İZLE' : phase === 'input' ? 'SIRAYLA DOKUN' : phase === 'break' ? '…' : 'HAZIR'}
      </p>
    </div>
  )
}
