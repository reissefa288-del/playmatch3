import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiPlus } from 'react-icons/fi'
import elmasIcon from '../../reference/opt/thumb/elmas.webp'
import { LazyImage } from '../../shared/LazyImage'
import { CurrencyPurchaseSheet } from './CurrencyPurchaseSheet'
import { formatGemBalance } from '../../shared/formatGemBalance'
import { useGemBalanceState } from './GemBalanceProvider'
import type { CurrencyKind } from './types'

type CurrencyNavPillsProps = {
  variant?: 'default' | 'match'
}

export function CurrencyNavPills({ variant = 'default' }: CurrencyNavPillsProps) {
  const [shopKind, setShopKind] = useState<CurrencyKind | null>(null)
  const { balance } = useGemBalanceState()

  const openGemsShop = useCallback(() => setShopKind('gems'), [])
  const closeShop = useCallback(() => setShopKind(null), [])

  const navClass = variant === 'match' ? 'pm-currency-nav pm-currency-nav--match' : 'pm-currency-nav'

  return (
    <>
      <div className={navClass}>
        <button
          type="button"
          className="pm-currency-nav__item is-gems"
          onClick={openGemsShop}
          aria-label={`Elmas bakiyesi: ${formatGemBalance(balance)}. Satın almak için dokunun.`}
        >
          <span className="pm-currency-nav__icon pm-currency-nav__gem" aria-hidden>
            <span className="pm-currency-nav__gem-aura" aria-hidden />
            <span className="pm-currency-nav__gem-flare" aria-hidden />
            <LazyImage src={elmasIcon} alt="" className="pm-currency-nav__gem-img" width={28} height={28} />
          </span>
          <span className="pm-currency-nav__amount">{formatGemBalance(balance)}</span>
          <span className="pm-currency-nav__plus" aria-hidden>
            <FiPlus />
          </span>
        </button>
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
