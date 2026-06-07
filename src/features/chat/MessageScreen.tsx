import '../../styles/message-final.css'
import '../../styles/message-screen.css'
import '../../styles/message-ambient.css'
import { Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { getChatDetail } from './data'
import { GameActivityCard } from './components/GameActivityCard'
import { MessageHeader } from './components/MessageHeader'
import { MessageInput } from './components/MessageInput'
import { MessageThread } from './components/MessageThread'

export function MessageScreen() {
  const { chatId } = useParams<{ chatId: string }>()
  const chat = chatId ? getChatDetail(chatId) : null

  if (!chat) {
    return <Navigate to="/chat" replace />
  }

  return (
    <motion.div
      className="pm-app-shell pm-app-shell--message"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.32 }}
    >
      <div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-message">
          <Navbar />
          <MessageHeader chat={chat} />
          <GameActivityCard lastGame={chat.lastGame} />
          <MessageThread
            chatId={chat.id}
            messages={chat.messages}
            portraitPosition={chat.portraitPosition}
          />
        </main>
        <div className="pm-message-input-wrap">
          <MessageInput />
        </div>
      </div>
    </motion.div>
  )
}
