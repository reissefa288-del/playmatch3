import { usePrefersReducedMotion } from '../../shared/usePrefersReducedMotion'
import { FiStar, FiX, FiZap } from 'react-icons/fi'
import { CurrencyImage } from './CurrencyImage'
import { currencyMeta, GEM_MOR_PACKAGE_IDS, morGemIcon } from './currencyPackages'
import { useGemBalance } from './GemBalanceProvider'
import type { CurrencyKind } from './types'

type CurrencyPurchaseSheetProps = {
  kind: CurrencyKind | null
  onClose: () => void
}

const gemPerks = [
  'Süper beğeni ile öne çık',
  'Boost ile daha fazla görünürlük',
  'Anında lobiye geç',
] as const

const PARTICLE_COUNT = 10

export function CurrencyPurchaseSheet({ kind, onClose }: CurrencyPurchaseSheetProps) {
  const reduceMotion = usePrefersReducedMotion()
  const { balance, add, formatBalance } = useGemBalance()

  const meta = kind ? currencyMeta[kind] : null

  if (!kind || !meta) return null

  return (
    <>
      <button
        type="button"
        className="pm-currency-shop__backdrop pm-sheet-backdrop-enter"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="pm-currency-shop__viewport pm-sheet-viewport-enter">
        <div
          className={`pm-currency-shop pm-currency-shop--premium pm-currency-shop--aaa${
            reduceMotion ? '' : ' pm-sheet-panel-enter'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pm-currency-shop-title"
        >
          <span className="pm-currency-shop__ambient" aria-hidden />
          <span className="pm-currency-shop__aura" aria-hidden />
          <span className="pm-currency-shop__particles" aria-hidden>
            {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
              <span key={i} className="pm-currency-shop__particle" />
            ))}
          </span>
          <span className="pm-currency-shop__frame-glow" aria-hidden />
          <span className="pm-currency-shop__frame-ring" aria-hidden />

          <div className="pm-currency-shop__body">
            <header className="pm-currency-shop__head">
              <div className="pm-currency-shop__hero">
                <span className="pm-currency-shop__hero-rays" aria-hidden />
                <CurrencyImage src={meta.icon} alt="" className="pm-currency-shop__hero-icon" width={64} height={64} />
                <span className="pm-currency-shop__hero-glow" aria-hidden />
                <span className="pm-currency-shop__hero-spark" aria-hidden />
              </div>
              <div className="pm-currency-shop__head-copy">
                <p className="pm-currency-shop__eyebrow">
                  <span>Premium mağaza</span>
                </p>
                <h2 id="pm-currency-shop-title">{meta.title}</h2>
                <p>{meta.subtitle}</p>
              </div>
              <button type="button" className="pm-currency-shop__close" onClick={onClose} aria-label="Kapat">
                <FiX />
              </button>
            </header>

            {kind === 'gems' ? (
              <div className="pm-currency-shop__balance" aria-live="polite">
                <span>Mevcut bakiye</span>
                <strong>{formatBalance(balance)} elmas</strong>
              </div>
            ) : null}

            {kind === 'gems' ? (
              <ul className="pm-currency-shop__perks" aria-label="Elmas avantajları">
                {gemPerks.map((perk) => (
                  <li key={perk}>
                    <FiZap aria-hidden />
                    {perk}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="pm-currency-shop__grid">
              {meta.packages.map((pkg) => {
                const total = pkg.amount + (pkg.bonus ?? 0)
                const showMorGem = kind === 'gems' && GEM_MOR_PACKAGE_IDS.has(pkg.id)
                return (
                  <article
                    key={pkg.id}
                    className={`pm-currency-shop__pkg${pkg.popular ? ' is-popular' : ''}${showMorGem ? ' has-mor-gem' : ''}`}
                  >
                    {pkg.popular ? <span className="pm-currency-shop__pkg-aura" aria-hidden /> : null}
                    {pkg.badge ? (
                      <span className="pm-currency-shop__badge">
                        <FiStar aria-hidden />
                        {pkg.badge}
                      </span>
                    ) : null}
                    {showMorGem ? (
                      <div className="pm-currency-shop__pkg-mor-hero" aria-hidden>
                        <span className="pm-currency-shop__pkg-mor-hero-glow" />
                        <CurrencyImage src={morGemIcon} alt="" width={48} height={48} />
                      </div>
                    ) : null}
                    <div className="pm-currency-shop__pkg-main">
                      <div className="pm-currency-shop__pkg-amount">
                        <strong>{pkg.amount.toLocaleString('tr-TR')}</strong>
                        {pkg.bonus ? (
                          <span className="pm-currency-shop__pkg-bonus">+{pkg.bonus} bonus</span>
                        ) : null}
                        <span className="pm-currency-shop__pkg-total">
                          Toplam {total.toLocaleString('tr-TR')} elmas
                        </span>
                      </div>
                      <div className="pm-currency-shop__pkg-meta">
                        {pkg.tagline ? (
                          <span className="pm-currency-shop__pkg-tagline">{pkg.tagline}</span>
                        ) : null}
                        <span className="pm-currency-shop__price">{pkg.priceLabel}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="pm-currency-shop__buy"
                      onClick={() => {
                        if (kind === 'gems') add(total)
                        onClose()
                      }}
                    >
                      Satın Al
                    </button>
                  </article>
                )
              })}
            </div>

            <p className="pm-currency-shop__note">
              Demo mağaza — ödeme entegrasyonu yakında. Satın alınca bakiye anında güncellenir.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
