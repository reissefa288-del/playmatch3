export type StackPhase = 'idle' | 'busy' | 'sent' | 'exiting'
export type ExitMode = 'match' | 'pass'
export type SentVariant = 'match' | 'super'

export type HeroStackSnapshot = {
  index: number
  phase: StackPhase
  exitMode: ExitMode
  sentVariant: SentVariant
}

const listeners = new Set<() => void>()

let snapshot: HeroStackSnapshot = {
  index: 0,
  phase: 'idle',
  exitMode: 'match',
  sentVariant: 'match',
}

function emit() {
  listeners.forEach((listener) => listener())
}

function patch(partial: Partial<HeroStackSnapshot>) {
  snapshot = { ...snapshot, ...partial }
  emit()
}

export function subscribeHeroStack(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getHeroStackSnapshot(): HeroStackSnapshot {
  return snapshot
}

export function resetHeroStack() {
  snapshot = {
    index: 0,
    phase: 'idle',
    exitMode: 'match',
    sentVariant: 'match',
  }
  emit()
}

export function setHeroStackPhase(phase: StackPhase) {
  if (snapshot.phase === phase) return
  patch({ phase })
}

export function setHeroStackExitMode(exitMode: ExitMode) {
  if (snapshot.exitMode === exitMode) return
  patch({ exitMode })
}

export function setHeroStackSentVariant(sentVariant: SentVariant) {
  if (snapshot.sentVariant === sentVariant) return
  patch({ sentVariant })
}

export function advanceHeroStackIndex() {
  patch({
    index: snapshot.index + 1,
    phase: 'idle',
    exitMode: 'match',
  })
}

export function rewindHeroStack() {
  if (snapshot.index <= 0) return
  patch({
    index: snapshot.index - 1,
    phase: 'idle',
    exitMode: 'match',
  })
}

export function beginHeroMatchFlow() {
  patch({ sentVariant: 'match', exitMode: 'match', phase: 'busy' })
}

export function beginHeroSuperLikeFlow() {
  patch({ sentVariant: 'super', exitMode: 'match', phase: 'busy' })
}

export function beginHeroPassFlow() {
  patch({ exitMode: 'pass', phase: 'exiting' })
}

export function markHeroSentPhase() {
  patch({ phase: 'sent' })
}

export function markHeroExitingPhase() {
  patch({ phase: 'exiting' })
}
