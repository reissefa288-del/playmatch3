import type { McSideState } from '../utils/missileCommandDuelEngine'

type Props = {
  side: McSideState
  now: number
}

export function RiftWardComboBadge({ side, now }: Props) {
  if (side.combo < 2 || side.comboUntil <= now) return null

  return (
    <span className={['pm-rw-combo-badge', side.combo >= 5 ? 'is-hot' : ''].filter(Boolean).join(' ')}>
      REZONANS ×{side.combo}
    </span>
  )
}
