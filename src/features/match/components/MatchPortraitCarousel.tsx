import type { MatchPhoto } from '../data'

type MatchPortraitCarouselProps = {
  photos: MatchPhoto[]
  index: number
}

export function MatchPortraitCarousel({ photos, index }: MatchPortraitCarouselProps) {
  const current = photos[index] ?? photos[0]

  return (
    <div className="pm-match-photo-carousel">
      <img
        key={current.id}
        src={current.src}
        alt=""
        className="pm-match-portrait-img"
        style={{ objectPosition: current.objectPosition }}
        draggable={false}
      />
    </div>
  )
}
