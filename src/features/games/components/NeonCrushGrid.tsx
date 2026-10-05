import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { GemId, NeonCell, SpecialKind } from '../utils/neonCrushEngine'
import type { NeonLaneState } from '../utils/neonCrushEngine'
import { comboFill, rowOf, specialLabel } from '../utils/neonCrushEngine'
import { GEM_ART, normalizeGemId } from './NeonGemIcon'
import { NeonFloatingScores } from './NeonFloatingScores'
import { NeonGemPopFx } from './NeonGemPopFx'
import { NeonMatchLines } from './NeonMatchLines'
import { NeonMatchParticles } from './NeonMatchParticles'
import { NeonSpecialGemShader } from './NeonSpecialGemShader'

const GEM_NAMES: Record<string, string> = {
  a1: 'Altın yıldız',
  a2: 'Mor küre',
  a3: 'Safir',
  a4: 'Zümrüt',
  a5: 'Turkuaz',
}

const PREMIUM_GEMS = new Set<GemId>(['a4', 'a5'])

const SPECIAL_CLASS: Record<SpecialKind, string> = {
  'stripe-h': 'is-special-stripe-h',
  'stripe-v': 'is-special-stripe-v',
  prism: 'is-special-prism',
}

type Props = {
  lane: NeonLaneState
  accent: 'cyan' | 'pink'
  interactive?: boolean
  selected?: number | null
  onTap?: (index: number) => void
}

function lineTierByIndex(lane: NeonLaneState): Map<number, 4 | 5> {
  const map = new Map<number, 4 | 5>()
  for (const seg of lane.fx?.segments ?? []) {
    if (seg.tier !== 4 && seg.tier !== 5) continue
    for (const i of seg.indices) map.set(i, seg.tier)
  }
  return map
}

export function NeonCrushGrid({ lane, accent, interactive = false, selected = null, onTap }: Props) {
  const comboPct = Math.round(comboFill(lane.combo) * 100)
  const popSet = new Set(lane.fx?.popIndices ?? [])
  const spawnSet = new Set(lane.settle?.indices ?? [])
  const pressureSet = new Set(lane.pressure?.indices ?? [])
  const isPressureBoard = lane.pressure != null
  const burst = lane.fx?.burst ?? null
  const showComboBurst = (lane.fx?.combo ?? 0) >= 2 || burst != null
  const fxTick = lane.fx?.tick ?? 0
  const isOpponentFx = !interactive && Boolean(lane.fx)
  const lineTiers = useMemo(() => lineTierByIndex(lane), [lane.fx?.segments, lane.fx?.tick])
  const swapPair = lane.fx?.swap ?? null
  const specialSpawn = lane.fx?.specialSpawn ?? null
  const specialActivate = lane.fx?.specialActivate ?? null

  return (
    <div
      className={[
        'pm-ncrush-board',
        `is-${accent}`,
        lane.fx ? 'has-fx' : '',
        isPressureBoard ? 'is-pressure-hit' : '',
        showComboBurst ? 'is-combo-hot' : '',
        burst ? `is-line-burst-${burst.tier}` : '',
        isOpponentFx ? 'is-opponent-fx' : '',
        selected != null ? 'has-selection' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {burst ? <span className={`pm-ncrush-board__line-shader is-tier-${burst.tier}`} aria-hidden /> : null}
      <span className="pm-ncrush-board__chrome" aria-hidden>
        <i className="pm-ncrush-board__chrome-corner pm-ncrush-board__chrome-corner--tl" />
        <i className="pm-ncrush-board__chrome-corner pm-ncrush-board__chrome-corner--tr" />
        <i className="pm-ncrush-board__chrome-corner pm-ncrush-board__chrome-corner--bl" />
        <i className="pm-ncrush-board__chrome-corner pm-ncrush-board__chrome-corner--br" />
        <i className="pm-ncrush-board__chrome-scan" />
      </span>

      <>
        {burst ? (
          <div
            key={`burst-${fxTick}`}
            className={`pm-ncrush-board__line-burst is-tier-${burst.tier} is-${accent}`}
           
           
           
           
          >
            <span className="pm-ncrush-board__line-burst-title">{burst.label}</span>
            <span className="pm-ncrush-board__line-burst-combo">{burst.comboLabel}</span>
          </div>
        ) : null}
      </>

      <>
        {lane.fx && lane.fx.scoreGain > 0 ? (
          <div
            key={fxTick}
            className={`pm-ncrush-board__score-pop is-${accent}`}
           
           
           
           
          >
            +{lane.fx.scoreGain.toLocaleString('tr-TR')}
            {burst ? (
              <small className={`is-tier-${burst.tier}`}>{burst.comboLabel}</small>
            ) : lane.fx.combo >= 2 ? (
              <small>COMBO ×{lane.fx.combo}</small>
            ) : null}
          </div>
        ) : null}
      </>

      <>
        {specialActivate ? (
          <div
            key={`act-${fxTick}`}
            className={`pm-ncrush-board__special-toast is-activate is-${accent}`}
           
           
           
           
          >
            {specialActivate.label}
          </div>
        ) : null}
        {specialSpawn && !specialActivate ? (
          <div
            key={`spawn-${fxTick}`}
            className={`pm-ncrush-board__special-toast is-spawn is-${accent}`}
           
           
           
           
          >
            {specialLabel(specialSpawn.kind)}
          </div>
        ) : null}
      </>

      <div className="pm-ncrush-board__cells">
        <div className="pm-ncrush-board__grid" role="grid" aria-label="Neon tahta">
          {lane.fx && lane.fx.segments.length > 0 ? (
            <NeonMatchLines segments={lane.fx.segments} swap={lane.fx.swap} accent={accent} />
          ) : null}
          {lane.fx && lane.fx.segments.length > 0 ? (
            <NeonMatchParticles segments={lane.fx.segments} accent={accent} tick={fxTick} />
          ) : null}
          {lane.fx && lane.fx.scoreGain > 0 ? (
            <NeonFloatingScores
              indices={lane.fx.popIndices}
              total={lane.fx.scoreGain}
              accent={accent}
              tier={burst?.tier ?? null}
              tick={fxTick}
            />
          ) : null}

          {lane.cells.map((cell: NeonCell, index) => {
            const gemId = normalizeGemId(cell.gem)
            const special = cell.special
            const isPopping = popSet.has(index)
            const isSpawning = spawnSet.has(index)
            const isPressureGem = pressureSet.has(index)
            const isSelected = selected === index
            const isSwapPulse = swapPair != null && (swapPair[0] === index || swapPair[1] === index)
            const lineTier = lineTiers.get(index)
            const isPremiumPop = isPopping && PREMIUM_GEMS.has(gemId)
            const isLinePop = isPopping && (lineTier === 4 || lineTier === 5)
            const isSpecialBorn = specialSpawn?.index === index
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
                  special ? SPECIAL_CLASS[special] : '',
                  isSpecialBorn ? 'is-special-born' : '',
                  isSelected ? 'is-selected' : '',
                  isSwapPulse ? 'is-swap-pulse' : '',
                  isPopping ? 'is-popping' : '',
                  isPremiumPop ? 'is-premium-pop' : '',
                  isLinePop && lineTier === 4 ? 'is-line-pop-4' : '',
                  isLinePop && lineTier === 5 ? 'is-line-pop-5' : '',
                  isSpawning ? 'is-spawning' : '',
                  isPressureGem ? 'is-pressure-gem' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={style}
                disabled={!interactive}
                onClick={() => onTap?.(index)}
                aria-label={GEM_NAMES[gemId] ?? gemId}
              >
                {isSelected ? <span className="pm-ncrush-gem__select-orbit" aria-hidden /> : null}
                <img
                  className="pm-ncrush-gem__img"
                  src={GEM_ART[gemId]}
                  alt=""
                  draggable={false}
                  decoding="async"
                />
                {special ? <NeonSpecialGemShader kind={special} accent={accent} /> : null}
                {isLinePop || isPremiumPop ? (
                  <span
                    className={[
                      'pm-ncrush-gem__shader',
                      `is-${gemId}`,
                      lineTier === 5 ? 'is-line-5' : lineTier === 4 ? 'is-line-4' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden
                  >
                    <i className="pm-ncrush-gem__shader-core" />
                    <i className="pm-ncrush-gem__shader-ring" />
                    <i className="pm-ncrush-gem__shader-rays" />
                    {lineTier === 5 ? <i className="pm-ncrush-gem__shader-flare" /> : null}
                  </span>
                ) : null}
                {isPopping ? <NeonGemPopFx accent={accent} mega={lineTier === 5} /> : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className={`pm-ncrush-board__footer is-${accent}`}>
        <div className="pm-ncrush-board__footer-top">
          <span className={`pm-ncrush-board__combo${lane.combo >= 2 || burst ? ' is-hot' : ''}`}>
            {burst ? burst.comboLabel : `COMBO ×${lane.combo}`}
          </span>
          <strong className="pm-ncrush-board__round">{lane.roundScore.toLocaleString('tr-TR')}</strong>
        </div>
        <div className="pm-ncrush-board__bar" aria-hidden>
          <i
            className={burst ? `is-tier-${burst.tier}` : ''}
            style={{ width: `${comboPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
