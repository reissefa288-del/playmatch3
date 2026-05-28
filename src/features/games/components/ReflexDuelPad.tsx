import type { ReflexPhase } from '../utils/reflexDuelEngine'

type Props = {
  phase: ReflexPhase
  disabled?: boolean
  onTap: () => void
}

const LABEL: Record<ReflexPhase, string> = {
  idle: 'HAZIR…',
  wait: 'BEKLE…',
  go: 'DOKUN!',
  result: '…',
}

export function ReflexDuelPad({ phase, disabled = false, onTap }: Props) {
  return (
    <button
      type="button"
      className={['pm-reflex-pad', `is-${phase}`, disabled ? 'is-disabled' : ''].filter(Boolean).join(' ')}
      disabled={disabled || phase === 'idle' || phase === 'result'}
      onClick={onTap}
      aria-label={LABEL[phase]}
    >
      <span className="pm-reflex-pad__ring" aria-hidden />
      <strong>{LABEL[phase]}</strong>
      {phase === 'wait' ? <small>Kırmızı — erken basma!</small> : null}
      {phase === 'go' ? <small>Yeşil — en hızlı sen ol!</small> : null}
    </button>
  )
}
