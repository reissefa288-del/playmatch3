import { FiCheck } from 'react-icons/fi'
import type { ChatMessage } from '../data'

type MessageThreadProps = {
  chatId: string
  messages: ChatMessage[]
  portraitSrc: string
  portraitPosition: string
  hasOlderMessages?: boolean
  loadingOlder?: boolean
  onLoadOlder?: () => void
}

const XOX_GRID = ['X', 'O', 'O', 'X', 'X', 'O', 'O', 'X', 'O'] as const

export function MessageThread({
  messages,
  portraitSrc,
  portraitPosition,
  hasOlderMessages = false,
  loadingOlder = false,
  onLoadOlder,
}: MessageThreadProps) {
  const portraitUrl = portraitSrc

  return (
    <div className="pm-message-thread" role="log" aria-label="Mesajlar">
      {hasOlderMessages && onLoadOlder ? (
        <div className="pm-message-thread__load-more">
          <button type="button" onClick={onLoadOlder} disabled={loadingOlder}>
            {loadingOlder ? 'Yükleniyor…' : 'Daha eski mesajlar'}
          </button>
        </div>
      ) : null}
      {messages.map((message) => {
        if (message.type === 'date') {
          return (
            <p
              key={message.id}
              className="pm-message-thread__date"
             
             
             
            >
              {message.label}
            </p>
          )
        }

        if (message.type === 'invite') {
          return (
            <article
              key={message.id}
              className="pm-message-invite"
             
             
             
            >
              <div className="pm-message-invite__body">
                <div className="pm-message-invite__art" aria-hidden>
                  <span className="pm-message-invite__grid">
                    {XOX_GRID.map((cell, i) => (
                      <span
                        key={i}
                        className={cell === 'X' ? 'is-x' : 'is-o'}
                      >
                        {cell}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="pm-message-invite__copy">
                  <strong className="pm-message-invite__title">{message.gameTitle}</strong>
                  <p>Seni oyuna davet etti</p>
                </div>
              </div>
              <button type="button" className="pm-message-invite__cta">
                Daveti Kabul Et
              </button>
            </article>
          )
        }

        const isMe = message.sender === 'me'
        return (
          <div
            key={message.id}
            className={`pm-message-bubble-row ${isMe ? 'is-me' : 'is-them'}`}
           
           
           
          >
            {!isMe ? (
              <span
                className="pm-message-bubble-row__avatar"
                style={{
                  backgroundImage: `url(${portraitUrl})`,
                  backgroundPosition: portraitPosition,
                }}
              />
            ) : null}
            <div className="pm-message-bubble-stack">
              <div className={`pm-message-bubble ${isMe ? 'is-me' : 'is-them'}`}>
                <p>{message.text}</p>
              </div>
              {message.time || (isMe && message.read) ? (
                <div className="pm-message-bubble-meta">
                  {message.time ? (
                    <time className="pm-message-bubble-meta__time" dateTime={message.time}>
                      {message.time}
                    </time>
                  ) : null}
                  {isMe && message.read ? (
                    <span className="pm-message-bubble-meta__read" aria-label="Okundu">
                      <FiCheck />
                      <FiCheck />
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
