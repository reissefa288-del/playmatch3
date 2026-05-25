export const GRID_COLS = 4
export const GRID_ROWS = 4
export const CARD_COUNT = GRID_COLS * GRID_ROWS
export const PAIR_COUNT = CARD_COUNT / 2
export const WIN_ROUNDS = 3
export const MATCH_ROUNDS = 5
export const ROUND_BREAK_MS = 2600
export const FLIP_BACK_MS = 680
export const ROUND_SECONDS = 90

export type MemorySymbol = 'star' | 'bolt' | 'heart' | 'diamond' | 'moon' | 'sun' | 'clover' | 'hex'

export const MEMORY_SYMBOLS: MemorySymbol[] = ['star', 'bolt', 'heart', 'diamond', 'moon', 'sun', 'clover', 'hex']

export const SYMBOL_GLYPH: Record<MemorySymbol, string> = {
  star: '★',
  bolt: '⚡',
  heart: '♥',
  diamond: '◆',
  moon: '☾',
  sun: '☀',
  clover: '✦',
  hex: '⬡',
}

export const SYMBOL_COLOR: Record<MemorySymbol, string> = {
  star: '#ffb347',
  bolt: '#5cff8a',
  heart: '#ff5a9a',
  diamond: '#b48cff',
  moon: '#7ecbff',
  sun: '#ffd76a',
  clover: '#6ef0c8',
  hex: '#5a9bff',
}

export type CardStatus = 'hidden' | 'shown' | 'matched'

export type MemoryCard = {
  symbol: MemorySymbol
  status: CardStatus
  pulse?: boolean
}

export type MatchParticle = {
  id: number
  x: number
  y: number
  life: number
}

export type LaneEvent = 'flip' | 'match' | 'miss' | 'win'

export type LaneState = {
  laneId: number
  cards: MemoryCard[]
  openIndices: number[]
  pairsFound: number
  combo: number
  matchPoints: number
  inputLocked: boolean
  flipBackPending: boolean
  particles: MatchParticle[]
  shake: number
  lastMatchIndex: number | null
  finished: boolean
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffleDeck(seed: number): MemorySymbol[] {
  const deck = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]
  const rand = mulberry32(seed)
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function createLane(laneId: number, seed = 11): LaneState {
  const symbols = shuffleDeck(seed)
  return {
    laneId,
    cards: symbols.map((symbol) => ({ symbol, status: 'hidden' as const })),
    openIndices: [],
    pairsFound: 0,
    combo: 0,
    matchPoints: 0,
    inputLocked: false,
    flipBackPending: false,
    particles: [],
    shake: 0,
    lastMatchIndex: null,
    finished: false,
  }
}

export function startNewRound(lane: LaneState, seed: number): LaneState {
  const next = createLane(lane.laneId, seed)
  return { ...next, matchPoints: lane.matchPoints }
}

export function decayLaneFx(lane: LaneState, dt: number): LaneState {
  const particles = lane.particles
    .map((p) => ({ ...p, life: p.life - dt }))
    .filter((p) => p.life > 0)
  const shake = Math.max(0, lane.shake - dt * 2.4)
  return { ...lane, particles, shake }
}

export function flipCard(lane: LaneState, index: number): { lane: LaneState; events: LaneEvent[] } {
  const events: LaneEvent[] = []
  if (lane.finished || lane.inputLocked || lane.flipBackPending) return { lane, events }
  const card = lane.cards[index]
  if (!card || card.status !== 'hidden') return { lane, events }

  const cards = lane.cards.map((c, i) => (i === index ? { ...c, status: 'shown' as const } : c))
  const openIndices = [...lane.openIndices, index]
  events.push('flip')

  if (openIndices.length < 2) {
    return { lane: { ...lane, cards, openIndices }, events }
  }

  const [a, b] = openIndices
  const symA = cards[a].symbol
  const symB = cards[b].symbol

  if (symA === symB) {
    const matched = cards.map((c, i) =>
      i === a || i === b ? { ...c, status: 'matched' as const, pulse: true } : c,
    )
    const pairsFound = lane.pairsFound + 1
    const combo = lane.combo + 1
    const finished = pairsFound >= PAIR_COUNT
    if (finished) events.push('win')
    events.push('match')
    return {
      lane: {
        ...lane,
        cards: matched,
        openIndices: [],
        pairsFound,
        combo,
        finished,
        lastMatchIndex: b,
        shake: 0.35,
        particles: [
          ...lane.particles,
          { id: performance.now(), x: 50, y: 50, life: 0.55 },
        ],
      },
      events,
    }
  }

  events.push('miss')
  const shown = cards.map((c, i) => (i === a || i === b ? { ...c, status: 'shown' as const } : c))
  return {
    lane: {
      ...lane,
      cards: shown,
      openIndices,
      combo: 0,
      inputLocked: true,
      flipBackPending: true,
      shake: 0.2,
    },
    events,
  }
}

export function applyFlipBack(lane: LaneState): LaneState {
  if (!lane.flipBackPending) return lane
  const cards = lane.cards.map((c) => (c.status === 'shown' ? { ...c, status: 'hidden' as const } : c))
  return {
    ...lane,
    cards,
    openIndices: [],
    inputLocked: false,
    flipBackPending: false,
  }
}

export function resolveRoundWinner(l1: LaneState, l2: LaneState): 'p1' | 'p2' | 'draw' {
  if (l1.finished && !l2.finished) return 'p1'
  if (l2.finished && !l1.finished) return 'p2'
  if (l1.finished && l2.finished) {
    if (l1.pairsFound > l2.pairsFound) return 'p1'
    if (l2.pairsFound > l1.pairsFound) return 'p2'
    return 'draw'
  }
  if (l1.pairsFound > l2.pairsFound) return 'p1'
  if (l2.pairsFound > l1.pairsFound) return 'p2'
  return 'draw'
}
