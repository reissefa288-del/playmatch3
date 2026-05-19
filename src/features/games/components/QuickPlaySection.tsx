import { motion, useReducedMotion } from 'framer-motion'
import type { QuickPlayOption } from '../data'

type QuickPlaySectionProps = {
  options: QuickPlayOption[]
}

export function QuickPlaySection({ options }: QuickPlaySectionProps) {
  const reduceMotion = useReducedMotion()
  const [primary, ...secondary] = options

  return (
    <section className="pm-quick-play" aria-label="Hızlı oyna">
      <header className="pm-games-section-head">
        <h3>Hızlı Oyna</h3>
        <span className="pm-games-section-head__live">
          <span className="pm-games-online-dot" />
          Anında eşleş
        </span>
      </header>
      <p className="pm-quick-play__subtitle">Rastgele oyuncularla hemen bir oyuna başla!</p>

      <div className="pm-quick-play__layout">
        <motion.article
          className={`pm-quick-play-card is-primary ${primary.accent === 'pink' ? 'is-pink' : 'is-blue'}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        >
          <span className="pm-quick-play-card__glow" aria-hidden />
          <div className="pm-quick-play-card__icon">
            <primary.icon />
          </div>
          <h4>{primary.title}</h4>
          <p>{primary.subtitle}</p>
          <motion.button
            type="button"
            whileHover={reduceMotion ? undefined : { scale: 1.04, y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          >
            <span className="pm-quick-play-card__btn-shine" aria-hidden />
            {primary.cta}
          </motion.button>
          <small>
            <span className="pm-games-online-dot" /> {primary.online}
          </small>
        </motion.article>

        <div className="pm-quick-play__stack">
          {secondary.map((option, index) => (
            <motion.article
              key={option.id}
              className={`pm-quick-play-card is-secondary ${option.accent === 'pink' ? 'is-pink' : 'is-blue'}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
              whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <span className="pm-quick-play-card__glow" aria-hidden />
              <div className="pm-quick-play-card__head">
                <motion.div className="pm-quick-play-card__icon">
                  <option.icon />
                </motion.div>
                <div>
                  <h4>{option.title}</h4>
                  <p>{option.subtitle}</p>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              >
                {option.cta}
              </motion.button>
              <small>
                <span className="pm-games-online-dot" /> {option.online}
              </small>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
