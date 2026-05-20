import { FiBell, FiEye, FiHeart, FiMessageCircle, FiShield, FiZap } from 'react-icons/fi'
import { LuCrown } from 'react-icons/lu'

type PremiumFeatureIconProps = {
  featureId: string
}

export function PremiumFeatureIcon({ featureId }: PremiumFeatureIconProps) {
  switch (featureId) {
    case 'likes':
      return (
        <span className="pm-feat-icon pm-feat-icon--likes">
          <FiHeart className="pm-feat-icon__heart-main" aria-hidden />
          <FiHeart className="pm-feat-icon__heart-float pm-feat-icon__heart-float--a" aria-hidden />
          <FiHeart className="pm-feat-icon__heart-float pm-feat-icon__heart-float--b" aria-hidden />
          <FiHeart className="pm-feat-icon__heart-float pm-feat-icon__heart-float--c" aria-hidden />
          <FiHeart className="pm-feat-icon__heart-float pm-feat-icon__heart-float--d" aria-hidden />
        </span>
      )
    case 'viewers':
      return (
        <span className="pm-feat-icon pm-feat-icon--viewers">
          <span className="pm-feat-icon__eye-wrap">
            <FiEye aria-hidden />
          </span>
        </span>
      )
    case 'boost':
      return (
        <span className="pm-feat-icon pm-feat-icon--boost">
          <FiZap aria-hidden />
          <span className="pm-feat-icon__strike" aria-hidden />
          <span className="pm-feat-icon__flash" aria-hidden />
        </span>
      )
    case 'read':
      return (
        <span className="pm-feat-icon pm-feat-icon--read">
          <FiMessageCircle aria-hidden />
          <span className="pm-feat-icon__notify" aria-hidden>
            <FiBell />
          </span>
        </span>
      )
    case 'ads':
      return (
        <span className="pm-feat-icon pm-feat-icon--ads">
          <span className="pm-feat-icon__shield-fill" aria-hidden />
          <FiShield aria-hidden />
        </span>
      )
    case 'badge':
      return (
        <span className="pm-feat-icon pm-feat-icon--badge">
          <span className="pm-feat-icon__crown-shine" aria-hidden />
          <LuCrown aria-hidden />
        </span>
      )
    default:
      return null
  }
}
