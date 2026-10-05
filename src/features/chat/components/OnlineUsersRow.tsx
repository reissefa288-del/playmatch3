import { FiPlus } from 'react-icons/fi'
import { fakePortraitForProfile } from '../../../shared/fakePortraits'
import type { OnlineUser } from '../data'

type OnlineUsersRowProps = {
  users: OnlineUser[]
  onNewChat: () => void
  onUserClick: (userId: string) => void
}

export function OnlineUsersRow({ users, onNewChat, onUserClick }: OnlineUsersRowProps) {
  return (
    <section
      className="pm-chat-online"
      aria-label="Çevrimiçi oyuncular"
     
     
     
    >
      <button
        type="button"
        className="pm-chat-online__new"
        onClick={onNewChat}
       
       
      >
        <span className="pm-chat-online__new-icon">
          <FiPlus />
        </span>
        <span>Yeni Sohbet</span>
      </button>

      {users.map((user) => (
        <button
          key={user.id}
          type="button"
          className={`pm-chat-online__user is-${user.ring}`}
         
         
         
         
          onClick={() => onUserClick(user.id)}
        >
          <span
            className="pm-chat-online__avatar"
            style={{
              backgroundImage: `url(${user.portraitSrc ?? fakePortraitForProfile(user.id)})`,
              backgroundPosition: user.portraitPosition,
            }}
          />
          <span className="pm-chat-online__dot" aria-hidden />
          <span className="pm-chat-online__name">{user.name}</span>
        </button>
      ))}
    </section>
  )
}
