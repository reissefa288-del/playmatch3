import { FiStar, FiX, FiZap } from 'react-icons/fi'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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

const shopStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.14 },
  },
}

const shopItem = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 380, damping: 28 },
  },
}

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

export function CurrencyPurchaseSheet({ kind, onClose }: CurrencyPurchaseSheetProps) {
  const reduceMotion = useReducedMotion()
  const { balance, add, formatBalance } = useGemBalance()

  const meta = kind ? currencyMeta[kind] : null

  return (
    <AnimatePresence>
      {kind && meta ? (
        <>
          <motion.button
            type="button"
            className="pm-currency-shop__backdrop"
            aria-label="Kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.28 }}
            onClick={onClose}
          />
          <motion.div
            className="pm-currency-shop__viewport"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.25 }}
          >
            <motion.div
              className="pm-currency-shop pm-currency-shop--premium pm-currency-shop--aaa"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pm-currency-shop-title"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={
                reduceMotion
                  ? { duration: 0.2 }
                  : { type: 'spring', stiffness: 360, damping: 30 }
              }
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

              <motion.div
                className="pm-currency-shop__body"
                variants={reduceMotion ? undefined : shopStagger}
                initial={reduceMotion ? false : 'hidden'}
                animate={reduceMotion ? false : 'show'}
              >
                <motion.header className="pm-currency-shop__head" variants={shopItem}>
                  <motion.div
                    className="pm-currency-shop__hero"
                    animate={
                      reduceMotion
                        ? undefined
                        : { y: [0, -6, 0], rotate: [0, 2, -2, 0] }
                    }
                    transition={{
                      duration: 5.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <span className="pm-currency-shop__hero-rays" aria-hidden />
                    <img src={meta.icon} alt="" className="pm-currency-shop__hero-icon" />
                    <span className="pm-currency-shop__hero-glow" aria-hidden />
                    <span className="pm-currency-shop__hero-spark" aria-hidden />
                  </motion.div>
                  <motion.div
                    className="pm-currency-shop__head-copy"
                    initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduceMotion ? 0 : 0.18, duration: 0.4 }}
                  >
                    <p className="pm-currency-shop__eyebrow">
                      <span>Premium mağaza</span>
                    </p>
                    <h2 id="pm-currency-shop-title">{meta.title}</h2>
                    <p>{meta.subtitle}</p>
                  </motion.div>
                  <motion.button
                    type="button"
                    className="pm-currency-shop__close"
                    onClick={onClose}
                    aria-label="Kapat"
                    whileHover={reduceMotion ? undefined : { scale: 1.06 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                  >
                    <FiX />
                  </motion.button>
                </motion.header>

                {kind === 'gems' ? (
                  <motion.div
                    className="pm-currency-shop__balance"
                    aria-live="polite"
                    variants={shopItem}
                  >
                    <span>Mevcut bakiye</span>
                    <strong>{formatBalance(balance)} elmas</strong>
                  </motion.div>
                ) : null}

                {kind === 'gems' ? (
                  <motion.ul
                    className="pm-currency-shop__perks"
                    aria-label="Elmas avantajları"
                    variants={reduceMotion ? undefined : listStagger}
                    initial={reduceMotion ? false : 'hidden'}
                    animate={reduceMotion ? false : 'show'}
                  >
                    {gemPerks.map((perk, index) => (
                      <motion.li
                        key={perk}
                        variants={shopItem}
                        custom={index}
                        whileHover={reduceMotion ? undefined : { x: 4 }}
                      >
                        <FiZap aria-hidden />
                        {perk}
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : null}

                <motion.div
                  className="pm-currency-shop__grid"
                  variants={reduceMotion ? undefined : listStagger}
                  initial={reduceMotion ? false : 'hidden'}
                  animate={reduceMotion ? false : 'show'}
                >
                  {meta.packages.map((pkg, index) => {
                    const total = pkg.amount + (pkg.bonus ?? 0)
                    const showMorGem = kind === 'gems' && GEM_MOR_PACKAGE_IDS.has(pkg.id)
                    return (
                      <motion.article
                        key={pkg.id}
                        className={`pm-currency-shop__pkg${pkg.popular ? ' is-popular' : ''}${showMorGem ? ' has-mor-gem' : ''}`}
                        variants={shopItem}
                        custom={index}
                        whileHover={
                          reduceMotion
                            ? undefined
                            : { scale: 1.02, y: -2, transition: { duration: 0.2 } }
                        }
                      >
                        {pkg.popular ? (
                          <span className="pm-currency-shop__pkg-aura" aria-hidden />
                        ) : null}
                        {pkg.badge ? (
                          <span className="pm-currency-shop__badge">
                            <FiStar aria-hidden />
                            {pkg.badge}
                          </span>
                        ) : null}
                        {showMorGem ? (
                          <motion.div
                            className="pm-currency-shop__pkg-mor-hero"
                            aria-hidden
                            initial={
                              reduceMotion ? false : { opacity: 0, scale: 0.65, y: 10 }
                            }
                            animate={
                              reduceMotion
                                ? { opacity: 1, scale: 1, y: 0 }
                                : {
                                    opacity: 1,
                                    scale: [1, 1.06, 1],
                                    y: [0, -8, 0],
                                    rotate: [0, -5, 5, 0],
                                  }
                            }
                            transition={
                              reduceMotion
                                ? { duration: 0.35 }
                                : {
                                    opacity: { duration: 0.45, delay: 0.25 + index * 0.06 },
                                    scale: {
                                      duration: 3,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                      delay: 0.5,
                                    },
                                    y: {
                                      duration: 3.2,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                      delay: 0.5,
                                    },
                                    rotate: {
                                      duration: 4,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                      delay: 0.5,
                                    },
                                  }
                            }
                          >
                            <span className="pm-currency-shop__pkg-mor-hero-glow" />
                            <img src={morGemIcon} alt="" />
                          </motion.div>
                        ) : null}
                        <motion.div
                          className="pm-currency-shop__pkg-main"
                          initial={reduceMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: reduceMotion ? 0 : 0.22 + index * 0.06 }}
                        >
                          <motion.div
                            className="pm-currency-shop__pkg-amount"
                            initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 420,
                              damping: 24,
                              delay: reduceMotion ? 0 : 0.28 + index * 0.06,
                            }}
                          >
                            <strong>{pkg.amount.toLocaleString('tr-TR')}</strong>
                            {pkg.bonus ? (
                              <span className="pm-currency-shop__pkg-bonus">
                                +{pkg.bonus} bonus
                              </span>
                            ) : null}
                            <span className="pm-currency-shop__pkg-total">
                              Toplam {total.toLocaleString('tr-TR')} elmas
                            </span>
                          </motion.div>
                          <motion.div
                            className="pm-currency-shop__pkg-meta"
                            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: reduceMotion ? 0 : 0.34 + index * 0.06 }}
                          >
                            {pkg.tagline ? (
                              <span className="pm-currency-shop__pkg-tagline">{pkg.tagline}</span>
                            ) : null}
                            <span className="pm-currency-shop__price">{pkg.priceLabel}</span>
                          </motion.div>
                        </motion.div>
                        <motion.button
                          type="button"
                          className="pm-currency-shop__buy"
                          onClick={() => {
                            if (kind === 'gems') add(total)
                            onClose()
                          }}
                          whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                        >
                          Satın Al
                        </motion.button>
                      </motion.article>
                    )
                  })}
                </motion.div>

                <motion.p className="pm-currency-shop__note" variants={shopItem}>
                  Demo mağaza — ödeme entegrasyonu yakında. Satın alınca bakiye anında güncellenir.
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
