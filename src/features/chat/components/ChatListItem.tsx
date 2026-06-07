import { memo } from 'react'
import { Link } from 'react-router-dom'
import { MdVerified } from 'react-icons/md'
import { motion } from 'framer-motion'
import { fakePortraitForProfile } from '../../../shared/fakePortraits'
import type { ChatThread } from '../data'

type ChatListItemProps = {
  thread: ChatThread
  index: number
}

export const ChatListItem = memo(function ChatListItem({ thread, index }: ChatListItemProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.28 }}
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

        {thread.unread ? <span className="pm-chat-item__badge">{thread.unread}</span> : null}
      </Link>
    </motion.div>
  )
})
