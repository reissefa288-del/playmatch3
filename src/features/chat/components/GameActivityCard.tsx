import type { ChatDetail } from '../data'

type GameActivityCardProps = {
  lastGame: ChatDetail['lastGame']
}

export function GameActivityCard({ lastGame }: GameActivityCardProps) {
  return (
    <section
      className="pm-message-activity"
     
     
     
      aria-label="Son oyun aktivitesi"
    >
      <span className="pm-message-activity__icon" aria-hidden>
        {lastGame.emoji}
      </span>
      <div className="pm-message-activity__copy">
        <p className="pm-message-activity__label">Birlikte Oyun Oynadınız</p>
        <p className="pm-message-activity__game-line">
          <strong className="pm-message-activity__game">{lastGame.title}</strong>
          <span className="pm-message-activity__ago">{lastGame.playedAgo}</span>
        </p>
      </div>
      <button
        type="button"
        className="pm-message-activity__cta"
       
       
      >
        Tekrar Oyna
      </button>
    </section>
  )
}
