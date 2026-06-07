import { FiPlus } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { fakePortraitForProfile } from '../../../shared/fakePortraits'
import type { OnlineUser } from '../data'

type OnlineUsersRowProps = {
  users: OnlineUser[]
  onNewChat: () => void
  onUserClick: (userId: string) => void
}

export function OnlineUsersRow({ users, onNewChat, onUserClick }: OnlineUsersRowProps) {
  return (
    <motion.section
      className="pm-chat-online"
      aria-label="Çevrimiçi oyuncular"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.4 }}
    >
      <motion.button
        type="button"
        className="pm-chat-online__new"
        onClick={onNewChat}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="pm-chat-online__new-icon">
          <FiPlus />
        </span>
        <span>Yeni Sohbet</span>
      </motion.button>

      {users.map((user, index) => (
        <motion.button
          key={user.id}
          type="button"
          className={`pm-chat-online__user is-${user.ring}`}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + index * 0.05, duration: 0.35 }}
          whileHover={{ y: -3 }}
          onClick={() => onUserClick(user.id)}
        >
          <span
            className="pm-chat-online__avatar"
            style={{
              backgroundImage: `url(${fakePortraitForProfile(user.id)})`,
              backgroundPosition: user.portraitPosition,
            }}
          />
          <span className="pm-chat-online__dot" aria-hidden />
          <span className="pm-chat-online__name">{user.name}</span>
        </motion.button>
      ))}
    </motion.section>
  )
}
