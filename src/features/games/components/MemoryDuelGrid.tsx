import { motion } from 'framer-motion'
import { SYMBOL_COLOR, SYMBOL_GLYPH, type LaneState, type MemorySymbol } from '../utils/memoryDuelEngine'
import { MemoryMatchFx } from './MemoryMatchFx'

type MemoryDuelGridProps = {
  lane: LaneState
  accent: 'cyan' | 'pink'
  interactive?: boolean
  onFlip?: (index: number) => void
}

export function MemoryDuelGrid({ lane, accent, interactive = false, onFlip }: MemoryDuelGridProps) {
  return (
    <motion.div
      className={`pm-memory-grid is-${accent}${lane.shake > 0 ? ' is-miss-shake' : ''}`}
      animate={lane.shake > 0 ? { x: [0, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="pm-memory-grid__cells">
        {lane.cards.map((card, index) => {
          const isMatchPulse = card.pulse && lane.lastMatchIndex === index
          return (
            <button
              key={index}
              type="button"
              className={`pm-memory-card ${card.status}${card.pulse ? ' is-pulse' : ''}${isMatchPulse ? ' is-match-burst' : ''}`}
              disabled={!interactive || card.status !== 'hidden' || lane.inputLocked || lane.finished}
              onClick={() => onFlip?.(index)}
              aria-label={card.status === 'hidden' ? 'Kart çevir' : SYMBOL_GLYPH[card.symbol]}
            >
              <span className="pm-memory-card__inner">
                <span className="pm-memory-card__face pm-memory-card__face--back" aria-hidden />
                <span
                  className="pm-memory-card__face pm-memory-card__face--front"
                  style={{ ['--sym-color' as string]: SYMBOL_COLOR[card.symbol] }}
                >
                  <span className="pm-memory-card__glyph-wrap">
                    <MemorySymbolIcon symbol={card.symbol} />
                  </span>
                </span>
              </span>
              {isMatchPulse ? <MemoryMatchFx accent={accent} /> : null}
              {card.pulse ? <span className="pm-memory-card__ring" aria-hidden /> : null}
            </button>
          )
        })}
      </div>

      {lane.combo > 1 ? (
        <motion.span
          className="pm-memory-grid__combo"
          initial={{ opacity: 0, scale: 0.6, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          key={lane.combo}
        >
          <span className="pm-memory-grid__combo-label">COMBO</span>
          <strong>x{lane.combo}</strong>
        </motion.span>
      ) : null}
    </motion.div>
  )
}

function MemorySymbolIcon({ symbol }: { symbol: MemorySymbol }) {
  const common = {
    className: 'pm-memory-card__icon',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (symbol) {
    case 'star':
      return (
        <svg {...common}>
          <path d="M12 2.4l2.7 5.7 6.3.6-4.8 4.1 1.5 6.2L12 16.7 6.3 19l1.5-6.2L3 8.7l6.3-.6L12 2.4z" />
        </svg>
      )
    case 'diamond':
      return (
        <svg {...common}>
          <path d="M12 2.8l7.6 9.2L12 21.2 4.4 12 12 2.8z" />
          <path d="M4.4 12h15.2" opacity={0.35} />
        </svg>
      )
    case 'gem':
      return (
        <svg {...common}>
          <path d="M12 3.2l6.8 6.8L12 20.8 5.2 10 12 3.2z" />
          <path d="M5.2 10h13.6" opacity={0.35} />
        </svg>
      )
    case 'heart':
      return (
        <svg {...common}>
          <path d="M12 20.5s-7-4.3-9.2-8.3C1 8.8 3.2 6 6.2 6c1.7 0 3.1.8 3.8 2 0.7-1.2 2.1-2 3.8-2 3 0 5.2 2.8 3.4 6.2C19 16.2 12 20.5 12 20.5z" />
        </svg>
      )
    case 'clover':
      return (
        <svg {...common}>
          <path d="M12 12c-1.6-2.7-5.3-2.5-6.3-.2-1 2.4 1.3 4.5 3.5 3.8" />
          <path d="M12 12c1.6-2.7 5.3-2.5 6.3-.2 1 2.4-1.3 4.5-3.5 3.8" />
          <path d="M12 12c-2.7 1.6-2.5 5.3-.2 6.3 2.4 1 4.5-1.3 3.8-3.5" />
          <path d="M12 12c2.7 1.6 2.5 5.3.2 6.3-2.4 1-4.5-1.3-3.8-3.5" />
          <path d="M12 12v9" opacity={0.35} />
        </svg>
      )
    case 'flame':
      return (
        <svg {...common}>
          <path d="M12 2c2.4 3 2.3 5.4.7 7.4-1.4 1.7-1.6 3.1-.7 4.3 1.1 1.4 3.4.8 4.3-1.1C18.1 16 16 21 12 21S5.9 18.3 5.9 14.6c0-2.6 1.6-4.3 3.3-5.9C10.5 7.4 11.4 5.2 11.3 3c.3-.4.5-.7.7-1z" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...common}>
          <path d="M20 14.2A7.4 7.4 0 019.8 4a6.6 6.6 0 1010.2 10.2z" />
        </svg>
      )
    case 'planet':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M3.2 13.3c2.1-2.2 5.6-4 9.4-4.6 3.8-.7 7.2 0 8.8 1.8" opacity={0.85} />
          <path d="M2.9 10.6c2.2 3 6.5 5.2 11 5.2 3.4 0 6.3-1.2 7.9-3" opacity={0.35} />
        </svg>
      )
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.6" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2" />
          <path d="M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M19.4 4.6l-1.6 1.6M6.2 17.8l-1.6 1.6" />
        </svg>
      )
    case 'crown':
      return (
        <svg {...common}>
          <path d="M4 18h16l-1.2-9.5-3.8 4.5-3.9-6.5-4 6.5-3.9-4.5L4 18z" />
          <path d="M6 18v2h12v-2" opacity={0.45} />
        </svg>
      )
    case 'rose':
      return (
        <svg {...common}>
          <path d="M12 21c4-2.2 6-5.5 6-9 0-3.2-2.4-5.7-6-6-3.6.3-6 2.8-6 6 0 3.5 2 6.8 6 9z" />
          <path d="M12 6.2c2.1.4 3.4 1.6 3.4 3.5 0 1.7-1 2.8-2.4 3.3" opacity={0.45} />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 2.5l7 3.2v6.2c0 5-3.2 8.4-7 9.6-3.8-1.2-7-4.6-7-9.6V5.7l7-3.2z" />
          <path d="M12 6.3v12.8" opacity={0.25} />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="6.5" />
        </svg>
      )
  }
}
