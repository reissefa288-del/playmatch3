import { Link } from 'react-router-dom'
import { FiArrowLeft, FiMoreVertical, FiPhone, FiVideo } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import type { ChatDetail } from '../data'

type MessageHeaderProps = {
  chat: ChatDetail
  onOpenModeration?: () => void
}

export function MessageHeader({ chat, onOpenModeration }: MessageHeaderProps) {
  return (
    <header
      className="pm-message-header"
     
     
     
    >
      <Link to="/chat" className="pm-message-header__back" aria-label="Geri">
        <FiArrowLeft />
      </Link>

      <span
        className="pm-message-header__avatar"
        style={{
          backgroundImage: `url(${chat.portraitSrc})`,
          backgroundPosition: chat.portraitPosition,
        }}
      />

      <div className="pm-message-header__info">
        <span className="pm-message-header__name-row">
          <strong>{chat.name}</strong>
          {chat.verified ? <MdVerified className="pm-message-header__verified" aria-label="Doğrulanmış" /> : null}
        </span>
        {chat.isOnline ? (
          <span className="pm-message-header__status">
            <span className="pm-message-header__dot" aria-hidden />
            Çevrimiçi
          </span>
        ) : null}
      </div>

      <div className="pm-message-header__actions">
        <button type="button" aria-label="Sesli arama">
          <FiPhone />
        </button>
        <button type="button" aria-label="Görüntülü arama">
          <FiVideo />
        </button>
        <button type="button" aria-label="Diğer" onClick={onOpenModeration}>
          <FiMoreVertical />
        </button>
      </div>
    </header>
  )
}
