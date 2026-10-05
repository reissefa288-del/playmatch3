import type { CSSProperties } from 'react'

type XoxPlacementFxProps = {
  index: number
  symbol: 'X' | 'O'
}

export function XoxPlacementFx({ index, symbol }: XoxPlacementFxProps) {
  const col = index % 3
  const row = Math.floor(index / 3)
  const left = `${(col + 0.5) * (100 / 3)}%`
  const top = `${(row + 0.5) * (100 / 3)}%`
  const isX = symbol === 'X'

  return (
    <div
      className={`pm-xox-placement-fx pm-xox-placement-fx--animate is-${symbol.toLowerCase()}`}
      style={{ left, top }}
      aria-hidden
    >
      <span className="pm-xox-placement-fx__ring pm-xox-placement-fx__ring--outer" />
      <span className="pm-xox-placement-fx__ring pm-xox-placement-fx__ring--inner" />
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const dist = isX ? 22 : 18
        return (
          <span
            key={i}
            className="pm-xox-placement-fx__spark"
            style={
              {
                '--spark-x': `${Math.cos(angle) * dist}px`,
                '--spark-y': `${Math.sin(angle) * dist}px`,
                '--spark-delay': `${i * 0.015}s`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
