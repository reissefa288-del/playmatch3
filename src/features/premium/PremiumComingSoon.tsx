import { Link } from 'react-router-dom'

export function PremiumComingSoon() {
  return (
    <div className="pm-app-shell pm-app-shell--premium">
      <div className="pm-artboard">
        <main className="pm-premium pm-premium--soon">
          <div className="pm-premium-soon">
            <p className="pm-premium-soon__eyebrow">Yakında</p>
            <h1 className="pm-premium-soon__title">Premium çok yakında</h1>
            <p className="pm-premium-soon__text">
              Kapalı test sürümünde satın alma kapalı. Sınırsız beğeni ve özel özellikler production
              öncesinde açılacak.
            </p>
            <Link to="/" className="pm-premium-soon__cta">
              Ana sayfaya dön
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
