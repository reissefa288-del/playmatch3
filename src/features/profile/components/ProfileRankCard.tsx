import type { IconType } from 'react-icons'
type ProfileRankCardProps = {
  tier: string
  label: string
  current: number
  max: number
  progress: number
  Emblem: IconType
}

export function ProfileRankCard({
  tier,
  label,
  current,
  max,
  progress,
  Emblem,
}: ProfileRankCardProps) {
  const pct = Math.round(progress * 100)

  return (
    <aside
      className="pm-profile-rank"
      aria-label="Siralama"
     
     
     
     
    >
      <span className="pm-profile-rank__shine" aria-hidden />
      <div className="pm-profile-rank__head">
        <div>
          <strong>{tier}</strong>
          <span>{label}</span>
        </div>
        <div className="pm-profile-rank__emblem">
          <Emblem aria-hidden />
        </div>
      </div>
      <p className="pm-profile-rank__xp">
        {current.toLocaleString('tr-TR')} / {max.toLocaleString('tr-TR')}
      </p>
      <div
        className="pm-profile-rank__bar"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
       
       
      >
        <span
          className="pm-profile-rank__fill"
         
         
         
        />
      </div>
    </aside>
  )
}
