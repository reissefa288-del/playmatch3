import { Link } from 'react-router-dom'
import { FiArrowLeft, FiMoreVertical, FiPhone, FiVideo } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import { motion } from 'framer-motion'
import { fakePortraitForProfile } from '../../../shared/fakePortraits'
import type { ChatDetail } from '../data'

type MessageHeaderProps = {
  chat: ChatDetail
}

export function MessageHeader({ chat }: MessageHeaderProps) {
  return (
    <motion.header
      className="pm-message-header"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Link to="/chat" className="pm-message-header__back" aria-label="Geri">
        <FiArrowLeft />
      </Link>

      <span
        className="pm-message-header__avatar"
        style={{
          backgroundImage: `url(${fakePortraitForProfile(chat.id)})`,
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

      <motion.div className="pm-message-header__actions">
        <motion.button type="button" aria-label="Sesli arama" whileTap={{ scale: 0.94 }}>
          <FiPhone />
        </motion.button>
        <motion.button type="button" aria-label="Görüntülü arama" whileTap={{ scale: 0.94 }}>
          <FiVideo />
        </motion.button>
        <motion.button type="button" aria-label="Diğer" whileTap={{ scale: 0.94 }}>
          <FiMoreVertical />
        </motion.button>
      </motion.div>
    </motion.header>
  )
}
