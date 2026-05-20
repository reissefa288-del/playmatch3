import { Link } from 'react-router-dom'
import { MdVerified } from 'react-icons/md'
import { motion } from 'framer-motion'
import { fakePortraitForProfile } from '../../../shared/fakePortraits'
import type { ChatThread } from '../data'

type ChatListItemProps = {
  thread: ChatThread
  index: number
}

export function ChatListItem({ thread, index }: ChatListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 + index * 0.04, duration: 0.35 }}
    >
      <Link
        to={`/chat/${thread.id}`}
        className={`pm-chat-item ${thread.highlighted ? 'is-highlighted' : ''} ${thread.isGroup ? 'is-group' : ''}`}
      >
        {thread.isGroup ? (
          <span className="pm-chat-item__avatar pm-chat-item__avatar--group">
            <span aria-hidden>{thread.groupEmoji}</span>
          </span>
        ) : (
          <span
            className="pm-chat-item__avatar"
            style={
              thread.portraitPosition
                ? {
                    backgroundImage: `url(${fakePortraitForProfile(thread.id)})`,
                    backgroundPosition: thread.portraitPosition,
                  }
                : undefined
            }
          />
        )}

        <span className="pm-chat-item__body">
          <span className="pm-chat-item__top">
            <span className="pm-chat-item__name-row">
              <strong>{thread.name}</strong>
              {thread.verified ? <MdVerified className="pm-chat-item__verified" aria-label="Doğrulanmış" /> : null}
            </span>
            <time>{thread.time}</time>
          </span>
          <span className="pm-chat-item__status">
            {thread.isOnline ? (
              <>
                <span className="pm-chat-item__online-dot" aria-hidden />
                Çevrimiçi
              </>
            ) : thread.lastSeen ? (
              <>Son görülme: {thread.lastSeen}</>
            ) : null}
          </span>
          <span className="pm-chat-item__preview">{thread.lastMessage}</span>
        </span>

        {thread.unread != null && thread.unread > 0 ? (
          <span className="pm-chat-item__badge">{thread.unread}</span>
        ) : null}
      </Link>
    </motion.div>
  )
}
