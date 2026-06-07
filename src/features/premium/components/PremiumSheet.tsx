import { useState } from 'react'
import { FiCheck, FiGift, FiX } from 'react-icons/fi'
import { LuCrown } from 'react-icons/lu'
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion'
import type { PremiumPackage } from '../data'
import { premiumPackages } from '../data'
import type { PremiumSheetKind } from '../usePremiumScreen'

const giftFriends = [
  { id: 'ece', name: 'Ece', handle: '@ece_gamer' },
  { id: 'mert', name: 'Mert', handle: '@mertxox' },
  { id: 'azra', name: 'Azra', handle: '@azra_play' },
] as const

type PremiumSheetProps = {
  kind: PremiumSheetKind
  selectedPackage: PremiumPackage
  selectedPackageId: string
  onSelectPackage: (id: string) => void
  onClose: () => void
  onConfirmUpgrade: () => void
  onConfirmGift: (friendName: string) => void
}

export function PremiumSheet({
  kind,
  selectedPackage,
  selectedPackageId,
  onSelectPackage,
  onClose,
  onConfirmUpgrade,
  onConfirmGift,
}: PremiumSheetProps) {
  const reduceMotion = usePrefersReducedMotion()
  const [giftTarget, setGiftTarget] = useState<string>(giftFriends[0].id)

  const giftFriend = giftFriends.find((f) => f.id === giftTarget) ?? giftFriends[0]

  if (!kind) return null

  return (
    <>
      <button
        type="button"
        className="pm-premium-sheet__backdrop pm-sheet-backdrop-enter"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="pm-premium-sheet__viewport pm-sheet-viewport-enter">
        <section
          className={`pm-premium-sheet${reduceMotion ? '' : ' pm-sheet-panel-enter'}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pm-premium-sheet-title"
        >
          <span className="pm-premium-sheet__shine" aria-hidden />

          <header className="pm-premium-sheet__head">
            <div className="pm-premium-sheet__head-icon" aria-hidden>
              {kind === 'gift' ? <FiGift /> : <LuCrown />}
            </div>
            <div className="pm-premium-sheet__head-copy">
              <p className="pm-premium-sheet__eyebrow">{kind === 'gift' ? 'Hediye' : 'Yükseltme'}</p>
              <h2 id="pm-premium-sheet-title">
                {kind === 'gift' ? 'Premium Hediye Et' : 'Hemen Yükselt'}
              </h2>
              <p>
                {kind === 'gift'
                  ? 'Arkadaşına premium ayrıcalıkları gönder.'
                  : 'Seçili paketle anında premium ol.'}
              </p>
            </div>
            <button type="button" className="pm-premium-sheet__close" onClick={onClose} aria-label="Kapat">
              <FiX />
            </button>
          </header>

          <div className="pm-premium-sheet__packages" role="radiogroup" aria-label="Paket seç">
            {premiumPackages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                role="radio"
                aria-checked={selectedPackageId === pkg.id}
                className={`pm-premium-sheet__pkg${
                  selectedPackageId === pkg.id ? ' is-selected' : ''
                }${pkg.popular ? ' is-popular' : ''}`}
                onClick={() => onSelectPackage(pkg.id)}
              >
                {pkg.popular ? <span className="pm-premium-sheet__pkg-tag">Popüler</span> : null}
                <span className="pm-premium-sheet__pkg-duration">{pkg.duration}</span>
                <strong>{pkg.price}</strong>
                {pkg.discount ? (
                  <em className="pm-premium-sheet__pkg-discount">{pkg.discount}</em>
                ) : null}
              </button>
            ))}
          </div>

          {kind === 'gift' ? (
            <ul className="pm-premium-sheet__friends" aria-label="Arkadaş seç">
              {giftFriends.map((friend) => (
                <li key={friend.id}>
                  <button
                    type="button"
                    className={`pm-premium-sheet__friend${
                      giftTarget === friend.id ? ' is-selected' : ''
                    }`}
                    onClick={() => setGiftTarget(friend.id)}
                  >
                    <span className="pm-premium-sheet__friend-avatar" aria-hidden>
                      {friend.name.charAt(0)}
                    </span>
                    <span>
                      <strong>{friend.name}</strong>
                      <small>{friend.handle}</small>
                    </span>
                    {giftTarget === friend.id ? <FiCheck aria-hidden /> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="pm-premium-sheet__summary">
              <span>Seçilen paket</span>
              <strong>
                {selectedPackage.duration} · {selectedPackage.price}
              </strong>
              <ul>
                {selectedPackage.perks.map((perk) => (
                  <li key={perk}>
                    <FiCheck aria-hidden />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            className={`pm-premium-sheet__cta${kind === 'gift' ? ' is-gift' : ' is-upgrade'}`}
            onClick={() => (kind === 'gift' ? onConfirmGift(giftFriend.name) : onConfirmUpgrade())}
          >
            <span className="pm-premium-sheet__cta-shine" aria-hidden />
            {kind === 'gift' ? <FiGift aria-hidden /> : <LuCrown aria-hidden />}
            {kind === 'gift'
              ? `${giftFriend.name}'a hediye gönder`
              : `${selectedPackage.price} ile yükselt`}
          </button>

          <p className="pm-premium-sheet__note">
            Demo ödeme — gerçek tahsilat yakında. İstediğin zaman iptal edebilirsin.
          </p>
        </section>
      </div>
    </>
  )
}
