import { useEffect } from 'react'
import { usePrefersReducedMotion } from '../../shared/usePrefersReducedMotion'
import { FiBell, FiHeart, FiMessageCircle, FiTrash2, FiUsers, FiX, FiZap } from 'react-icons/fi'
import { LuGamepad2 } from 'react-icons/lu'
import { ShopGlassShader } from '../currency/ShopGlassShader'
import type { AppNotification, NotificationKind } from './types'

const kindIcon: Record<NotificationKind, typeof FiHeart> = {
  match: FiUsers,
  like: FiHeart,
  game: LuGamepad2,
  message: FiMessageCircle,
  system: FiZap,
}

const kindLabel: Record<NotificationKind, string> = {
  match: 'Eşleşme',
  like: 'Beğeni',
  game: 'Davet',
  message: 'Mesaj',
  system: 'Sistem',
}

type NotificationsSheetProps = {
  open: boolean
  items: AppNotification[]
  unreadCount: number
  onClose: () => void
  onDismiss: (id: string) => void
  onItemAction: (item: AppNotification) => void
}

export function NotificationsSheet({
  open,
  items,
  unreadCount,
  onClose,
  onDismiss,
  onItemAction,
}: NotificationsSheetProps) {
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (open) void import('../../styles/notifications.css')
  }, [open])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="pm-notifications__backdrop pm-sheet-backdrop-enter"
        aria-label="Bildirimleri kapat"
        onClick={onClose}
      />
      <section
        className={`pm-notifications${reduceMotion ? '' : ' pm-sheet-modal-enter--notif'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-notifications-title"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <ShopGlassShader />
        <header className="pm-notifications__head">
          <div className="pm-notifications__head-brand">
            <span className="pm-notifications__bell" aria-hidden>
              <FiBell />
            </span>
            <div className="pm-notifications__head-title">
              <h2 id="pm-notifications-title">Bildirimler</h2>
              {unreadCount > 0 ? (
                <p className="pm-notifications__sub">{unreadCount} okunmamış</p>
              ) : items.length > 0 ? (
                <p className="pm-notifications__sub">Tümü okundu</p>
              ) : null}
            </div>
          </div>
          <button type="button" className="pm-notifications__close" onClick={onClose} aria-label="Kapat">
            <FiX />
          </button>
        </header>

        <ul className="pm-notifications__list">
          {items.length === 0 ? (
            <li className="pm-notifications__empty">
              <span className="pm-notifications__empty-icon" aria-hidden>
                <FiBell />
              </span>
              <strong>Bildirim yok</strong>
              <p>Eşleşme, beğeni ve davet burada durur.</p>
            </li>
          ) : (
            items.map((item) => {
              const Icon = kindIcon[item.kind]
              return (
                <li
                  key={item.id}
                  className={`pm-notifications__card${item.read ? '' : ' is-unread'}`}
                  data-kind={item.kind}
                >
                  <button type="button" className="pm-notifications__item" onClick={() => onItemAction(item)}>
                    <span className="pm-notifications__accent" aria-hidden />
                    <span className="pm-notifications__avatar">
                      <span className="pm-notifications__initial">{item.avatarInitial ?? '•'}</span>
                      <span className="pm-notifications__kind-icon" aria-hidden>
                        <Icon />
                      </span>
                      {!item.read ? <span className="pm-notifications__dot" aria-hidden /> : null}
                    </span>
                    <span className="pm-notifications__copy">
                      <span className="pm-notifications__meta">
                        <span className="pm-notifications__pill">{kindLabel[item.kind]}</span>
                        <small>{item.timeLabel}</small>
                      </span>
                      <strong>{item.title}</strong>
                      <span className="pm-notifications__body">{item.body}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="pm-notifications__dismiss"
                    aria-label="Bildirimi kaldır"
                    onClick={() => onDismiss(item.id)}
                  >
                    <FiTrash2 aria-hidden />
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </section>
    </>
  )
}
