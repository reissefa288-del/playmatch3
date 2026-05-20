import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiPlus } from 'react-icons/fi'
import elmasIcon from '../../reference/elmas.png'
import { CurrencyPurchaseSheet } from './CurrencyPurchaseSheet'
import { useGemBalance } from './GemBalanceProvider'
import type { CurrencyKind } from './types'

type CurrencyNavPillsProps = {
  variant?: 'default' | 'match'
}

export function CurrencyNavPills({ variant = 'default' }: CurrencyNavPillsProps) {
  const [shopKind, setShopKind] = useState<CurrencyKind | null>(null)
  const { balance, formatBalance } = useGemBalance()

  const openGemsShop = useCallback(() => setShopKind('gems'), [])
  const closeShop = useCallback(() => setShopKind(null), [])

  const navClass = variant === 'match' ? 'pm-currency-nav pm-currency-nav--match' : 'pm-currency-nav'

  return (
    <>
      <div className={navClass}>
        <div
          className="pm-currency-nav__item is-gems"
          role="group"
          aria-label={`Elmas bakiyesi: ${formatBalance(balance)}`}
        >
          <button
            type="button"
            className="pm-currency-nav__tap"
            onClick={openGemsShop}
            aria-label="Elmas satın alma ekranını aç"
          >
            <span className="pm-currency-nav__icon pm-currency-nav__gem" aria-hidden>
              <span className="pm-currency-nav__gem-aura" aria-hidden />
              <span className="pm-currency-nav__gem-flare" aria-hidden />
              <img src={elmasIcon} alt="" className="pm-currency-nav__gem-img" />
            </span>
            <span className="pm-currency-nav__amount">{formatBalance(balance)}</span>
          </button>
          <button
            type="button"
            className="pm-currency-nav__plus"
            aria-label="Elmas satın al"
            onClick={openGemsShop}
          >
            <FiPlus />
          </button>
        </div>
      </div>
      {typeof document !== 'undefined'
        ? createPortal(
            <CurrencyPurchaseSheet kind={shopKind} onClose={closeShop} />,
            document.body,
          )
        : null}
    </>
  )
}
