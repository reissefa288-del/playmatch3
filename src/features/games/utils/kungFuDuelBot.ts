import { blockForAttack, tryBlock, tryStrike, type KungFuSideState } from './kungFuDuelEngine'

export function tickKungFuBot(side: KungFuSideState, now: number): KungFuSideState {
  if (side.playerHp <= 0) return side

  if (side.phase === 'attack' && side.attackKind) {
    return tryBlock(side, blockForAttack(side.attackKind), now, () => Math.random())
  }

  if (side.phase === 'opening') {
    const strike =
      side.attackKind === 'low' ? 'kick' : side.attackKind === 'rush' ? 'punch' : ('palm' as const)
    return tryStrike(side, strike, now, () => Math.random())
  }

  return side
}
