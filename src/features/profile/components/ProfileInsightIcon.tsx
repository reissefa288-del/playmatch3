import { PremiumFeatureIcon } from '../../premium/components/PremiumFeatureIcon'

export type ProfileInsightKind = 'likes' | 'visits'

type ProfileInsightIconProps = {
  kind: ProfileInsightKind
}

function featureIdForKind(kind: ProfileInsightKind) {
  return kind === 'likes' ? 'likes' : 'viewers'
}

export function ProfileInsightIcon({ kind }: ProfileInsightIconProps) {
  const featureId = featureIdForKind(kind)

  return (
    <span className={`pm-profile-insight-icon pm-profile-insight-icon--${kind}`} aria-hidden>
      <span className="pm-profile-insight-icon__orb" />
      <span className="pm-profile-insight-icon__ring" />
      <span className="pm-profile-insight-icon__box">
        <PremiumFeatureIcon featureId={featureId} />
        <span className="pm-profile-insight-icon__spark" />
      </span>
    </span>
  )
}
