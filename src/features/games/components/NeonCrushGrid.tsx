import { AnimatePresence, motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { GemId } from '../utils/neonCrushEngine'
import type { NeonLaneState } from '../utils/neonCrushEngine'
import { comboFill, rowOf } from '../utils/neonCrushEngine'
import { GEM_ART, normalizeGemId } from './NeonGemIcon'
import { NeonGemPopFx } from './NeonGemPopFx'
import { NeonMatchLines } from './NeonMatchLines'

const GEM_NAMES: Record<string, string> = {
  a1: 'Altın yıldız',
  a2: 'Mor küre',
  a3: 'Safir',
  a4: 'Zümrüt',
  a5: 'Turkuaz',
}

const PREMIUM_GEMS = new Set<GemId>(['a4', 'a5'])

type Props = {
  lane: NeonLaneState
  accent: 'cyan' | 'pink'
  interactive?: boolean
  selected?: number | null
  onTap?: (index: number) => void
}

export function NeonCrushGrid({ lane, accent, interactive = false, selected = null, onTap }: Props) {
  const comboPct = Math.round(comboFill(lane.combo) * 100)
  const popSet = new Set(lane.fx?.popIndices ?? [])
  const spawnSet = new Set(lane.settle?.indices ?? [])
  const showComboBurst = (lane.fx?.combo ?? 0) >= 2
  const fxTick = lane.fx?.tick ?? 0
  const isOpponentFx = !interactive && Boolean(lane.fx)

  return (
    <div
      className={[
        'pm-ncrush-board',
        `is-${accent}`,
        lane.fx ? 'has-fx' : '',
        showComboBurst ? 'is-combo-hot' : '',
        isOpponentFx ? 'is-opponent-fx' : '',
        selected != null ? 'has-selection' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <AnimatePresence>
        {lane.fx && lane.fx.scoreGain > 0 ? (
          <motion.div
            key={fxTick}
            className={`pm-ncrush-board__score-pop is-${accent}`}
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          >
            +{lane.fx.scoreGain.toLocaleString('tr-TR')}
            {lane.fx.combo >= 2 ? <small>COMBO ×{lane.fx.combo}</small> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pm-ncrush-board__cells">
        <div className="pm-ncrush-board__grid" role="grid" aria-label="Neon tahta">
          {lane.fx && lane.fx.segments.length > 0 ? (
            <NeonMatchLines segments={lane.fx.segments} swap={lane.fx.swap} accent={accent} />
          ) : null}

          {lane.cells.map((gem, index) => {
            const gemId = normalizeGemId(gem)
            const isPopping = popSet.has(index)
            const isSpawning = spawnSet.has(index)
            const isSelected = selected === index
            const isPremiumPop = isPopping && PREMIUM_GEMS.has(gemId)
            const spawnRow = rowOf(index)

            const style: CSSProperties | undefined = isSpawning
              ? ({ '--spawn-row': spawnRow } as CSSProperties)
              : undefined

            return (
              <button
                key={index}
                type="button"
                role="gridcell"
                className={[
                  'pm-ncrush-gem',
                  `is-${gemId}`,
                  isSelected ? 'is-selected' : '',
                  isPopping ? 'is-popping' : '',
                  isPremiumPop ? 'is-premium-pop' : '',
                  isSpawning ? 'is-spawning' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={style}
                disabled={!interactive}
                onClick={() => onTap?.(index)}
                aria-label={GEM_NAMES[gemId] ?? gemId}
              >
                <img
                  className="pm-ncrush-gem__img"
                  src={GEM_ART[gemId]}
                  alt=""
                  draggable={false}
                  decoding="async"
                />
                {isPremiumPop ? (
                  <span className={`pm-ncrush-gem__shader is-${gemId}`} aria-hidden>
                    <i className="pm-ncrush-gem__shader-core" />
                    <i className="pm-ncrush-gem__shader-ring" />
                    <i className="pm-ncrush-gem__shader-rays" />
                  </span>
                ) : null}
                {isPopping ? <NeonGemPopFx accent={accent} /> : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className={`pm-ncrush-board__footer is-${accent}`}>
        <div className="pm-ncrush-board__footer-top">
          <span className={`pm-ncrush-board__combo${lane.combo >= 2 ? ' is-hot' : ''}`}>
            COMBO ×{lane.combo}
          </span>
          <strong className="pm-ncrush-board__round">{lane.roundScore.toLocaleString('tr-TR')}</strong>
        </div>
        <div className="pm-ncrush-board__bar" aria-hidden>
          <motion.i
            animate={{ width: `${comboPct}%` }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          />
        </div>
      </div>
    </div>
  )
}
