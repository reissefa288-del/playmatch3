import { motion } from 'framer-motion'
import { SYMBOL_COLOR, SYMBOL_GLYPH, type LaneState, type MemorySymbol } from '../utils/memoryDuelEngine'

type MemoryDuelGridProps = {
  lane: LaneState
  accent: 'cyan' | 'pink'
  interactive?: boolean
  onFlip?: (index: number) => void
}

export function MemoryDuelGrid({ lane, accent, interactive = false, onFlip }: MemoryDuelGridProps) {
  return (
    <motion.div
      className={`pm-memory-grid is-${accent}`}
      animate={lane.shake > 0 ? { x: [0, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.18 }}
    >
      <span className="pm-memory-grid__corner pm-memory-grid__corner--tl" aria-hidden />
      <span className="pm-memory-grid__corner pm-memory-grid__corner--tr" aria-hidden />
      <span className="pm-memory-grid__corner pm-memory-grid__corner--bl" aria-hidden />
      <span className="pm-memory-grid__corner pm-memory-grid__corner--br" aria-hidden />

      <motion.div className="pm-memory-grid__cells">
        {lane.cards.map((card, index) => (
          <button
            key={index}
            type="button"
            className={`pm-memory-card ${card.status}${card.pulse ? ' is-pulse' : ''}`}
            disabled={!interactive || card.status !== 'hidden' || lane.inputLocked || lane.finished}
            onClick={() => onFlip?.(index)}
            aria-label={card.status === 'hidden' ? 'Kart çevir' : SYMBOL_GLYPH[card.symbol]}
          >
            <span className="pm-memory-card__inner">
              <span className="pm-memory-card__face pm-memory-card__face--back">
                <span className="pm-memory-card__back-gem" aria-hidden />
                <span className="pm-memory-card__back-shine" aria-hidden />
              </span>
              <span
                className="pm-memory-card__face pm-memory-card__face--front"
                style={{ ['--sym-color' as string]: SYMBOL_COLOR[card.symbol] }}
              >
                <span className="pm-memory-card__sym-orb">
                  <SymbolIcon symbol={card.symbol} />
                </span>
                <span className="pm-memory-card__shine" aria-hidden />
              </span>
            </span>
            {card.pulse && lane.lastMatchIndex === index ? (
              <span className="pm-memory-card__ring" aria-hidden />
            ) : null}
          </button>
        ))}
      </motion.div>

      {lane.combo > 1 ? (
        <motion.span
          className="pm-memory-grid__combo"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          key={lane.combo}
        >
          x{lane.combo}
        </motion.span>
      ) : null}
    </motion.div>
  )
}

function SymbolIcon({ symbol }: { symbol: MemorySymbol }) {
  return <span className="pm-memory-card__glyph">{SYMBOL_GLYPH[symbol]}</span>
}
