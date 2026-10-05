import { memo } from 'react'
import { Link } from 'react-router-dom'
import { MdVerified } from 'react-icons/md'
import { fakePortraitForProfile } from '../../../shared/fakePortraits'
import type { ChatThread } from '../data'

type ChatListItemProps = {
  thread: ChatThread
  index: number
}

function chatListItemPropsEqual(prev: ChatListItemProps, next: ChatListItemProps) {
  if (prev.index !== next.index) return false
  const a = prev.thread
  const b = next.thread
  return (
    a.id === b.id &&
    a.lastMessage === b.lastMessage &&
    a.time === b.time &&
    a.unread === b.unread &&
    a.isOnline === b.isOnline &&
    a.highlighted === b.highlighted &&
    a.lastSeen === b.lastSeen &&
    a.name === b.name &&
    a.portraitSrc === b.portraitSrc
  )
}

export const ChatListItem = memo(function ChatListItem({ thread, index }: ChatListItemProps) {
  return (
    <div
      className="pm-fade-up-enter"
      style={{ animationDelay: `${index * 0.04}s` }}
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
                    backgroundImage: `url(${thread.portraitSrc ?? fakePortraitForProfile(thread.id)})`,
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
    </div>
  )
}, chatListItemPropsEqual)
