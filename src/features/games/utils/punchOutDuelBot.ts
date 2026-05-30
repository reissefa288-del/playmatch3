import { dodgeForAttack, tryDodge, tryPunch, type PunchOutSideState } from './punchOutDuelEngine'

export function tickPunchOutBot(side: PunchOutSideState, now: number): PunchOutSideState {
  if (side.playerHp <= 0) return side

  if (side.phase === 'attack' && side.attackKind) {
    return tryDodge(side, dodgeForAttack(side.attackKind), now, () => Math.random())
  }

  if (side.phase === 'opening') {
    const punches = ['jab', 'hook', 'uppercut'] as const
    const punch = side.attackKind === 'body' ? 'uppercut' : side.attackKind === 'left' ? 'hook' : 'jab'
    if (Math.random() < 0.85) return tryPunch(side, punch, now, () => Math.random())
    return tryPunch(side, punches[Math.floor(Math.random() * punches.length)]!, now, () => Math.random())
  }

  return side
}
