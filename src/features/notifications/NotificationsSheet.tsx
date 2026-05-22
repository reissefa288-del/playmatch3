import { FiBell, FiHeart, FiMessageCircle, FiTrash2, FiUsers, FiX, FiZap } from 'react-icons/fi'
import { LuGamepad2 } from 'react-icons/lu'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="pm-notifications__backdrop"
            aria-label="Bildirimleri kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            className="pm-notifications"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pm-notifications-title"
            style={{ x: '-50%', y: '-50%' }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: '-48%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, scale: 0.94, x: '-50%', y: '-48%' }
            }
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          >
            <span className="pm-notifications__aura" aria-hidden />
            <span className="pm-notifications__rim" aria-hidden />

            <header className="pm-notifications__head">
              <div className="pm-notifications__head-brand">
                <span className="pm-notifications__bell" aria-hidden>
                  <FiBell />
                </span>
                <div className="pm-notifications__head-title">
                  <h2 id="pm-notifications-title">Bildirimler</h2>
                  <p className="pm-notifications__sub">
                    {unreadCount > 0
                      ? `${unreadCount} okunmamış bildirim`
                      : 'Tüm bildirimler okundu'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="pm-notifications__close"
                onClick={onClose}
                aria-label="Kapat"
              >
                <FiX />
              </button>
            </header>

            <ul className="pm-notifications__list">
              {items.length === 0 ? (
                <li className="pm-notifications__empty">
                  <span className="pm-notifications__empty-icon" aria-hidden>
                    <FiBell />
                  </span>
                  <strong>Şimdilik sessiz</strong>
                  <p>Yeni bildirim geldiğinde burada görünecek.</p>
                </li>
              ) : (
                items.map((item, index) => {
                  const Icon = kindIcon[item.kind]
                  return (
                    <motion.li
                      key={item.id}
                      className={`pm-notifications__card${item.read ? '' : ' is-unread'}`}
                      data-kind={item.kind}
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: reduceMotion ? 0 : index * 0.06,
                        duration: 0.32,
                      }}
                    >
                      <button
                        type="button"
                        className="pm-notifications__item"
                        onClick={() => onItemAction(item)}
                      >
                        <span className="pm-notifications__accent" aria-hidden />
                        <span className="pm-notifications__avatar">
                          <span className="pm-notifications__initial">
                            {item.avatarInitial ?? '•'}
                          </span>
                          <span className="pm-notifications__kind-icon" aria-hidden>
                            <Icon />
                          </span>
                          {!item.read ? (
                            <span className="pm-notifications__dot" aria-hidden />
                          ) : null}
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
                    </motion.li>
                  )
                })
              )}
            </ul>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  )
}
