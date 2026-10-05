import {
  CHAT_SEND_MAX_PER_WINDOW,
  CHAT_SEND_MIN_INTERVAL_MS,
  CHAT_SEND_WINDOW_MS,
} from './chatConstants'

let lastSendAt = 0
const sendTimestamps: number[] = []

export class ChatSendRateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChatSendRateLimitError'
  }
}

/** ADIM 6.3 — istemci tarafı mesaj gönderim sınırı */
export function assertChatSendAllowed(): void {
  const now = Date.now()

  if (now - lastSendAt < CHAT_SEND_MIN_INTERVAL_MS) {
    throw new ChatSendRateLimitError('Çok hızlı gönderiyorsun. Biraz bekle.')
  }

  while (sendTimestamps.length > 0 && sendTimestamps[0]! < now - CHAT_SEND_WINDOW_MS) {
    sendTimestamps.shift()
  }

  if (sendTimestamps.length >= CHAT_SEND_MAX_PER_WINDOW) {
    throw new ChatSendRateLimitError('Dakikada çok fazla mesaj gönderdin. Kısa bir ara ver.')
  }
}

export function recordChatSend(): void {
  const now = Date.now()
  lastSendAt = now
  sendTimestamps.push(now)
}
