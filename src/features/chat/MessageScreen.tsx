import '../../styles/message-final.css'
import '../../styles/message-screen.css'
import '../../styles/message-ambient.css'
import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { GameActivityCard } from './components/GameActivityCard'
import { MessageHeader } from './components/MessageHeader'
import { MessageInput } from './components/MessageInput'
import { MessageThread } from './components/MessageThread'
import { ModerationFlow } from '../moderation/components/ModerationFlow'
import { useChatDetail } from './useChatDetail'

export function MessageScreen() {
  const { chatId } = useParams<{ chatId: string }>()
  const { chat, allowed, loading, sending, sendError, sendMessage, loadOlderMessages, hasOlderMessages, loadingOlder } =
    useChatDetail(chatId)
  const [moderationOpen, setModerationOpen] = useState(false)

  if (loading) {
    return null
  }

  if (!chat || allowed === false) {
    return <Navigate to="/chat" replace />
  }

  return (
    <div className="pm-app-shell pm-app-shell--message">
      <div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-message">
          <Navbar />
          <MessageHeader chat={chat} onOpenModeration={() => setModerationOpen(true)} />
          <GameActivityCard lastGame={chat.lastGame} />
          <MessageThread
            chatId={chat.id}
            messages={chat.messages}
            portraitSrc={chat.portraitSrc}
            portraitPosition={chat.portraitPosition}
            hasOlderMessages={hasOlderMessages}
            loadingOlder={loadingOlder}
            onLoadOlder={() => void loadOlderMessages()}
          />
        </main>
        <div className="pm-message-input-wrap">
          {sendError ? (
            <p className="pm-message-input__error" role="alert">
              {sendError}
            </p>
          ) : null}
          <MessageInput onSend={sendMessage} sending={sending} />
        </div>
      </div>
      <ModerationFlow
        open={moderationOpen}
        targetUid={chat.id}
        targetName={chat.name}
        source="chat"
        leaveChatOnBlock
        onClose={() => setModerationOpen(false)}
      />
    </div>
  )
}
