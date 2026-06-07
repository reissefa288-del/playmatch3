import { FiUser } from 'react-icons/fi'
import { INTEREST_EMOJI, matchPreferenceLabel } from '../onboardingSteps'
import type { UserProfile } from '../onboardingProfile'

type OnboardingPreviewCardProps = {
  draft: UserProfile
}

export function OnboardingPreviewCard({ draft }: OnboardingPreviewCardProps) {
  const displayName = draft.name.trim() || 'Profilin'
  const hasPhoto = Boolean(draft.photoUrl)
  const visibleInterests = draft.interests.slice(0, 4)
  const extraInterests = draft.interests.length - visibleInterests.length

  return (
    <aside className="pm-onboard-preview" aria-label="Profil önizlemesi">
      <p className="pm-onboard-preview__label">Canlı önizleme</p>
      <div className="pm-onboard-preview__card">
        <div className="pm-onboard-preview__avatar">
          {hasPhoto ? (
            <img src={draft.photoUrl} alt="" />
          ) : (
            <FiUser aria-hidden />
          )}
        </div>
        <div className="pm-onboard-preview__info">
          <strong>
            {displayName}
            {draft.age >= 18 ? `, ${draft.age}` : ''}
          </strong>
          <span>{matchPreferenceLabel(draft.matchPreference)} ile eşleş</span>
        </div>
        {visibleInterests.length > 0 ? (
          <div className="pm-onboard-preview__tags">
            {visibleInterests.map((tag) => (
              <span key={tag}>
                {INTEREST_EMOJI[tag] ?? '•'} {tag}
              </span>
            ))}
            {extraInterests > 0 ? <span className="pm-onboard-preview__more">+{extraInterests}</span> : null}
          </div>
        ) : (
          <p className="pm-onboard-preview__empty">İlgi alanlarını seçince burada görünür</p>
        )}
        {draft.bio.trim() ? (
          <p className="pm-onboard-preview__bio">&ldquo;{draft.bio.trim().slice(0, 80)}{draft.bio.length > 80 ? '…' : ''}&rdquo;</p>
        ) : null}
      </div>
    </aside>
  )
}
