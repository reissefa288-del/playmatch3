import { flipCard, type LaneState } from './memoryDuelEngine'

export type BotMemory = Map<number, string>

export function createBotMemory(): BotMemory {
  return new Map()
}

export function rememberCard(memory: BotMemory, index: number, symbol: string) {
  memory.set(index, symbol)
}

export function botThinkDelayMs(combo: number, hasOneOpen = false): number {
  if (hasOneOpen) return 340 + Math.random() * 260
  return 280 + Math.random() * 240 - combo * 8
}

function hiddenIndices(lane: LaneState): number[] {
  return lane.cards
    .map((c, i) => (c.status === 'hidden' ? i : -1))
    .filter((i) => i >= 0)
}

function pickKnownPair(lane: LaneState, memory: BotMemory): number[] | null {
  const bySymbol = new Map<string, number[]>()
  for (const [index, symbol] of memory.entries()) {
    if (lane.cards[index]?.status !== 'hidden') continue
    const list = bySymbol.get(symbol) ?? []
    list.push(index)
    bySymbol.set(symbol, list)
  }
  for (const indices of bySymbol.values()) {
    if (indices.length >= 2) return [indices[0], indices[1]]
  }
  return null
}

function pickRandomHidden(lane: LaneState, exclude: number[] = []): number | null {
  const pool = hiddenIndices(lane).filter((i) => !exclude.includes(i))
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export function pickBotFlip(lane: LaneState, memory: BotMemory, _seed: number): number | null {
  const hesitate = Math.random() < 0.1

  if (lane.openIndices.length === 1 && !hesitate) {
    const first = lane.openIndices[0]
    const sym = lane.cards[first]?.symbol
    if (sym) {
      for (const [index, known] of memory.entries()) {
        if (known === sym && lane.cards[index]?.status === 'hidden' && index !== first) {
          return index
        }
      }
    }
  }

  const pair = pickKnownPair(lane, memory)
  if (pair && !hesitate) {
    const target =
      lane.openIndices.length === 0 ? pair[0] : pair.find((i) => !lane.openIndices.includes(i))
    if (target != null) return target
  }

  const rand = pickRandomHidden(lane, lane.openIndices)
  if (rand != null) return rand

  return null
}

export function runBotFlip(lane: LaneState, memory: BotMemory, seed: number) {
  const index = pickBotFlip(lane, memory, seed)
  if (index == null) return { lane, events: [] as ReturnType<typeof flipCard>['events'], moved: false, needsFlipBack: false }
  const result = flipCard(lane, index)
  const card = result.lane.cards[index]
  if (card && card.status !== 'hidden') rememberCard(memory, index, card.symbol)
  return {
    ...result,
    moved: true,
    needsFlipBack: result.lane.flipBackPending,
  }
}
