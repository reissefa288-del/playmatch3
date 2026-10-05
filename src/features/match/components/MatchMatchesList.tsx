import { LazyImage } from '../../../shared/LazyImage'
import type { MatchProfile } from '../data'

type MatchMatchesListProps = {
  matches: MatchProfile[]
  loading: boolean
}

export function MatchMatchesList({ matches, loading }: MatchMatchesListProps) {
  if (loading) {
    return (
      <div className="pm-match-empty pm-match-empty-enter">
        <p className="pm-match-empty__title">Eşleşmelerim</p>
        <p className="pm-match-empty__text">Eşleşmeler yükleniyor…</p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="pm-match-empty pm-match-empty-enter">
        <p className="pm-match-empty__title">Henüz eşleşme yok</p>
        <p className="pm-match-empty__text">
          Keşfet sekmesinden profilleri beğen. Karşılıklı beğeni olduğunda burada görünür.
        </p>
      </div>
    )
  }

  return (
    <div className="pm-match-matches-list pm-match-empty-enter" aria-label="Eşleşmelerim">
      {matches.map((profile) => (
        <article key={profile.id} className="pm-match-matches-list__item">
          <LazyImage
            src={profile.portraitSrc}
            alt=""
            className="pm-match-matches-list__avatar"
            width={56}
            height={56}
          />
          <div className="pm-match-matches-list__meta">
            <strong>
              {profile.name}, {profile.age}
            </strong>
            <span>{profile.location}</span>
          </div>
          <span className="pm-match-matches-list__badge" aria-hidden>
            ♥
          </span>
        </article>
      ))}
    </div>
  )
}
