import { FiCheck } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { fakePortraitForProfile } from '../../../shared/fakePortraits'
import type { ChatMessage } from '../data'

type MessageThreadProps = {
  chatId: string
  messages: ChatMessage[]
  portraitPosition: string
}

const XOX_GRID = ['X', 'O', 'O', 'X', 'X', 'O', 'O', 'X', 'O'] as const

export function MessageThread({ chatId, messages, portraitPosition }: MessageThreadProps) {
  const portraitUrl = fakePortraitForProfile(chatId)

  return (
    <div className="pm-message-thread" role="log" aria-label="Mesajlar">
      {messages.map((message, index) => {
        if (message.type === 'date') {
          return (
            <motion.p
              key={message.id}
              className="pm-message-thread__date"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.04 }}
            >
              {message.label}
            </motion.p>
          )
        }

        if (message.type === 'invite') {
          return (
            <motion.article
              key={message.id}
              className="pm-message-invite"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
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
              <motion.button type="button" className="pm-message-invite__cta" whileTap={{ scale: 0.97 }}>
                Daveti Kabul Et
              </motion.button>
            </motion.article>
          )
        }

        const isMe = message.sender === 'me'
        return (
          <motion.div
            key={message.id}
            className={`pm-message-bubble-row ${isMe ? 'is-me' : 'is-them'}`}
            initial={{ opacity: 0, y: 10, x: isMe ? 8 : -8 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
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
          </motion.div>
        )
      })}
    </div>
  )
}
