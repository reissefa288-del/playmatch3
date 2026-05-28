import { GRID_SIZE, type SnakeLaneState } from '../utils/snakeDuelEngine'

type Props = {
  lane: SnakeLaneState
  accent: 'cyan' | 'pink'
}

export function SnakeDuelGrid({ lane, accent }: Props) {
  const bodySet = new Set(lane.body)
  const head = lane.body[0]

  return (
    <div className={`pm-snake-board is-${accent} ${lane.alive ? '' : 'is-dead'}`}>
      <div className="pm-snake-board__meta">
        <span>{lane.score}</span>
        <small>UZUNLUK {lane.length}</small>
      </div>
      <div className="pm-snake-board__cells" role="grid" aria-label="Yılan alanı">
        {Array.from({ length: GRID_SIZE }, (_, index) => {
          const isHead = index === head
          const isBody = bodySet.has(index) && !isHead
          const isFood = index === lane.food
          return (
            <span
              key={index}
              className={[
                'pm-snake-cell',
                isHead ? 'is-head' : '',
                isBody ? 'is-body' : '',
                isFood ? 'is-food' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          )
        })}
      </div>
    </div>
  )
}
