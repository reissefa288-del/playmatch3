import type { MatchPhoto } from '../data'

type MatchPortraitCarouselProps = {
  photos: MatchPhoto[]
  index: number
  dragPx?: number
  dragging?: boolean
}

export function MatchPortraitCarousel({
  photos,
  index,
  dragPx = 0,
  dragging = false,
}: MatchPortraitCarouselProps) {
  return (
    <div className="pm-match-photo-carousel">
      <div
        className={`pm-match-photo-track${dragging ? ' is-dragging' : ''}`}
        style={{ transform: `translateX(calc(-${index * 100}% + ${dragPx}px))` }}
      >
        {photos.map((photo) => (
          <div key={photo.id} className="pm-match-photo-slide">
            <img
              src={photo.src}
              alt=""
              className="pm-match-portrait-img"
              style={{ objectPosition: photo.objectPosition }}
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
