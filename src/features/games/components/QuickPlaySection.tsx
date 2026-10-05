import type { QuickPlayOption } from '../data'

type QuickPlaySectionProps = {
  options: QuickPlayOption[]
}

export function QuickPlaySection({ options }: QuickPlaySectionProps) {
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
        <article
          className={`pm-quick-play-card is-primary ${primary.accent === 'pink' ? 'is-pink' : 'is-blue'}`}
         
         
         
         
         
        >
          <span className="pm-quick-play-card__glow" aria-hidden />
          <div className="pm-quick-play-card__icon">
            <primary.icon />
          </div>
          <h4>{primary.title}</h4>
          <p>{primary.subtitle}</p>
          <button
            type="button"
           
           
          >
            <span className="pm-quick-play-card__btn-shine" aria-hidden />
            {primary.cta}
          </button>
          <small>
            <span className="pm-games-online-dot" /> {primary.online}
          </small>
        </article>

        <div className="pm-quick-play__stack">
          {secondary.map((option) => (
            <article
              key={option.id}
              className={`pm-quick-play-card is-secondary ${option.accent === 'pink' ? 'is-pink' : 'is-blue'}`}
             
             
             
             
             
            >
              <span className="pm-quick-play-card__glow" aria-hidden />
              <div className="pm-quick-play-card__head">
                <div className="pm-quick-play-card__icon">
                  <option.icon />
                </div>
                <div>
                  <h4>{option.title}</h4>
                  <p>{option.subtitle}</p>
                </div>
              </div>

              <button
                type="button"
               
               
              >
                {option.cta}
              </button>
              <small>
                <span className="pm-games-online-dot" /> {option.online}
              </small>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
