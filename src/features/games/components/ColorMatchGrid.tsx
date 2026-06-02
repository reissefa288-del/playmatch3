import { motion } from 'framer-motion'
import type { ColorId, ColorLaneState } from '../utils/colorMatchEngine'
import { COLS, isTargetColor, remainingMatches, ROWS } from '../utils/colorMatchEngine'

type Props = {
  lane: ColorLaneState
  accent: 'cyan' | 'pink'
  interactive?: boolean
  onTap?: (index: number) => void
}

const COLOR_LABELS: Record<ColorId, string> = {
  violet: 'Mor',
  gold: 'Altın',
  cyan: 'Camgöbeği',
  pink: 'Pembe',
}

function TargetsPanel({ lane }: { lane: ColorLaneState }) {
  const left = remainingMatches(lane)
  return (
    <div className="pm-cmatch-targets" key={lane.targetKey}>
      <span className="pm-cmatch-targets__label">HEDEF RENKLER</span>
      <div className="pm-cmatch-targets__row" role="list" aria-label="Hedef renkler">
        {lane.targets.map((color) => (
          <motion.div
            key={`${lane.targetKey}-${color}`}
            className={`pm-cmatch-targets__chip is-${color}`}
            role="listitem"
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            <span className="pm-cmatch-targets__swatch" aria-hidden />
            <span className="pm-cmatch-targets__name">{COLOR_LABELS[color]}</span>
          </motion.div>
        ))}
      </div>
      <span className="pm-cmatch-targets__hint">
        Kalan eşleşme: <strong>{left}</strong>
      </span>
    </div>
  )
}

export function ColorMatchGrid({ lane, accent, interactive = false, onTap }: Props) {
  return (
    <div className={`pm-cmatch-lane is-${accent}`}>
      <TargetsPanel lane={lane} />
      <div
        className={[
          'pm-cmatch-grid',
          lane.lastFx === 'miss' && interactive ? 'has-shake' : '',
          lane.lastFx === 'hit' && interactive ? 'has-pulse' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          className="pm-cmatch-grid__cells"
          role="grid"
          aria-label="Renk ızgarası"
          style={{
            gridTemplateColumns: `repeat(${COLS}, var(--cm-cell))`,
            gridTemplateRows: `repeat(${ROWS}, var(--cm-cell))`,
          }}
        >
          {lane.cells.map((cell, index) => {
            const isMatch = isTargetColor(lane.targets, cell.color)
            return (
              <button
                key={`${lane.targetKey}-${index}`}
                type="button"
                role="gridcell"
                className={[
                  'pm-cmatch-cell',
                  `is-${cell.color}`,
                  cell.cleared ? 'is-cleared' : '',
                  isMatch && !cell.cleared ? 'is-matchable' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={!interactive || cell.cleared}
                onClick={() => onTap?.(index)}
                aria-label={
                  cell.cleared
                    ? `${COLOR_LABELS[cell.color]} eşleşti`
                    : `${COLOR_LABELS[cell.color]} kare`
                }
              />
            )
          })}
        </div>
      </div>
      <div className="pm-cmatch-lane__stats" aria-label="İstatistik">
        <span>
          İsabet <strong>{lane.hits}</strong>
        </span>
        <span>
          Kaçırma <strong>{lane.misses}</strong>
        </span>
      </div>
    </div>
  )
}
