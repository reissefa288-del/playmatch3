import { FiX } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'
import { currencyMeta } from './currencyPackages'
import { useGemBalance } from './GemBalanceProvider'
import type { CurrencyKind } from './types'

type CurrencyPurchaseSheetProps = {
  kind: CurrencyKind | null
  onClose: () => void
}

export function CurrencyPurchaseSheet({ kind, onClose }: CurrencyPurchaseSheetProps) {
  const { add, formatBalance } = useGemBalance()

  return (
    <AnimatePresence>
      {kind ? (
        <>
          <motion.button
            type="button"
            className="pm-currency-shop__backdrop"
            aria-label="Kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="pm-currency-shop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pm-currency-shop-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <header className="pm-currency-shop__head">
              <div className="pm-currency-shop__hero">
                <img src={currencyMeta[kind].icon} alt="" className="pm-currency-shop__hero-icon" />
                <span className="pm-currency-shop__hero-glow" aria-hidden />
              </div>
              <div>
                <h2 id="pm-currency-shop-title">{currencyMeta[kind].title}</h2>
                <p>{currencyMeta[kind].subtitle}</p>
              </div>
              <button type="button" className="pm-currency-shop__close" onClick={onClose} aria-label="Kapat">
                <FiX />
              </button>
            </header>

            <div className="pm-currency-shop__grid">
              {currencyMeta[kind].packages.map((pkg) => (
                <article
                  key={pkg.id}
                  className={`pm-currency-shop__pkg${pkg.popular ? ' is-popular' : ''}`}
                >
                  {pkg.badge ? <span className="pm-currency-shop__badge">{pkg.badge}</span> : null}
                  <strong>{pkg.amount.toLocaleString('tr-TR')}</strong>
                  {pkg.bonus ? <small>+{pkg.bonus} bonus</small> : null}
                  <span className="pm-currency-shop__price">{pkg.priceLabel}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (kind === 'gems') add(pkg.amount + (pkg.bonus ?? 0))
                      onClose()
                    }}
                  >
                    Satın Al
                  </button>
                </article>
              ))}
            </div>

            <p className="pm-currency-shop__note">
              Demo: Bakiye {kind === 'gems' ? formatBalance() : 'güncellendi'}. Ödeme entegrasyonu yakında.
            </p>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
