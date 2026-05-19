import { useState } from 'react'
import { createPortal } from 'react-dom'
import { FiPlus } from 'react-icons/fi'
import elmasIcon from '../../reference/elmas.png'
import { CurrencyPurchaseSheet } from './CurrencyPurchaseSheet'
import { useGemBalance } from './GemBalanceProvider'
import type { CurrencyKind } from './types'

export function CurrencyNavPills() {
  const [shopKind, setShopKind] = useState<CurrencyKind | null>(null)
  const { balance, formatBalance } = useGemBalance()

  const sheet =
    shopKind && typeof document !== 'undefined'
      ? createPortal(
          <CurrencyPurchaseSheet kind={shopKind} onClose={() => setShopKind(null)} />,
          document.body,
        )
      : null

  return (
    <>
      <div className="pm-currency-nav">
        <div className="pm-currency-nav__item is-gems">
          <div className="pm-currency-nav__icon" aria-hidden>
            <img src={elmasIcon} alt="" />
          </div>
          <span className="pm-currency-nav__amount">{formatBalance(balance)}</span>
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
