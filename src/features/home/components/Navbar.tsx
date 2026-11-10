import { CurrencyNavPills } from '../../currency/CurrencyNavPills'

type NavbarProps = {
  currencyVariant?: 'default' | 'match'
}

export function Navbar({ currencyVariant = 'default' }: NavbarProps) {
  return (
    <header className="pm-navbar">
      <div className="pm-brand pm-brand--aaa">
        <h1 className="pm-brand__wordmark">
          <span className="pm-brand__wordmark-play">Play</span>
          <span className="pm-brand__wordmark-meet">Meet</span>
        </h1>
      </div>

      <div className="pm-navbar__right">
        <CurrencyNavPills variant={currencyVariant} />
      </div>
    </header>
  )
}
