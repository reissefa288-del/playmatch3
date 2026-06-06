import type { PickupKind } from '../utils/snakeDuelEngine'

type Props = {
  accent: 'cyan' | 'pink'
  kind: PickupKind
}

export function SnakePickupBurst({ accent, kind }: Props) {
  return (
    <span className={`pm-snake-pickup-burst is-${accent} is-${kind}`} aria-hidden>
      <span className="pm-snake-pickup-burst__ring" />
      <span className="pm-snake-pickup-burst__core" />
      {Array.from({ length: 8 }, (_, i) => (
        <i key={i} className="pm-snake-pickup-burst__spark" style={{ ['--i' as string]: i }} />
      ))}
    </span>
  )
}
