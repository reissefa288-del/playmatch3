import { useState } from 'react'
import { createPortal } from 'react-dom'
import { FiPlus } from 'react-icons/fi'
import altinIcon from '../../reference/altın.png'
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

  const sheet =
    shopKind && typeof document !== 'undefined'
      ? createPortal(
          <CurrencyPurchaseSheet kind={shopKind} onClose={() => setShopKind(null)} />,
          document.body,
        )
      : null

  const navClass = variant === 'match' ? 'pm-currency-nav pm-currency-nav--match' : 'pm-currency-nav'

  return (
    <>
      <div className={navClass}>
        {variant === 'match' ? (
          <div className="pm-currency-nav__item is-gold">
            <div className="pm-currency-nav__icon" aria-hidden>
              <img src={altinIcon} alt="" />
            </div>
            <span className="pm-currency-nav__amount">2.450</span>
            <button type="button" className="pm-currency-nav__plus" aria-label="Altın satın al">
              <FiPlus />
            </button>
          </div>
        ) : null}
        <div className="pm-currency-nav__item is-gems">
          <div className="pm-currency-nav__icon" aria-hidden>
            <img src={elmasIcon} alt="" />
          </div>
          <span className="pm-currency-nav__amount">
            {variant === 'match' ? '180' : formatBalance(balance)}
          </span>
          <button
            type="button"
            className="pm-currency-nav__plus"
            aria-label="Elmas satın al"
            onClick={() => setShopKind('gems')}
          >
            <FiPlus />
          </button>
        </div>
      </div>
      {sheet}
    </>
  )
}
