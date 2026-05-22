import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { FiBell } from 'react-icons/fi'
import { CurrencyNavPills } from '../../currency/CurrencyNavPills'
import { NotificationsSheet } from '../../notifications/NotificationsSheet'
import { useNotifications } from '../../notifications/useNotifications'

type NavbarProps = {
  currencyVariant?: 'default' | 'match'
}

export function Navbar({ currencyVariant = 'default' }: NavbarProps) {
  const {
    items,
    open,
    unreadCount,
    openPanel,
    closePanel,
    dismiss,
    onItemAction,
  } = useNotifications()

  const sheet = useMemo(
    () =>
      open && typeof document !== 'undefined'
        ? createPortal(
            <NotificationsSheet
              open={open}
              items={items}
              unreadCount={unreadCount}
              onClose={closePanel}
              onDismiss={dismiss}
              onItemAction={onItemAction}
            />,
            document.body,
          )
        : null,
    [open, items, unreadCount, closePanel, dismiss, onItemAction],
  )

  return (
    <>
      <header className="pm-navbar">
        <div className="pm-brand pm-brand--aaa">
          <h1 className="pm-brand__wordmark">
            <span className="pm-brand__wordmark-play">Play</span>
            <span className="pm-brand__wordmark-meet">Meet</span>
          </h1>
        </div>

        <div className="pm-navbar__right">
          <CurrencyNavPills variant={currencyVariant} />

          <button
            className={`pm-icon-button pm-icon-button--bell${open ? ' is-open' : ''}`}
            type="button"
            aria-label="Bildirimler"
            aria-expanded={open}
            onClick={open ? closePanel : openPanel}
          >
            <FiBell />
            {unreadCount > 0 ? <span className="pm-badge">{unreadCount}</span> : null}
          </button>
        </div>
      </header>
      {sheet}
    </>
  )
}
