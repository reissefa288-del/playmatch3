import { premiumGiftCta } from '../data'

type PremiumTitleBarProps = {
  onGift: () => void
}

export function PremiumTitleBar({ onGift }: PremiumTitleBarProps) {
  const GiftIcon = premiumGiftCta.icon

  return (
    <header className="pm-premium-title-bar">
      <div
        className="pm-premium-title-bar__copy"
       
       
       
      >
        <h1>Premium</h1>
        <p>Daha fazlasını keşfet, ayrıcalıkları yaşa! ✨</p>
      </div>
      <button
        type="button"
        className="pm-premium-gift-btn"
       
       
       
       
       
        onClick={onGift}
      >
        <GiftIcon aria-hidden />
        {premiumGiftCta.label}
      </button>
    </header>
  )
}
