import type { IconType } from 'react-icons'
import { FiUsers } from 'react-icons/fi'
import { LuGamepad2 } from 'react-icons/lu'
import { bottomNavigation } from '../home/data'
import type { BottomNavItem } from '../home/types'

export type ChatTabId = 'all' | 'online' | 'groups' | 'invites'

export type OnlineUser = {
  id: string
  name: string
  portraitPosition: string
  ring: 'pink' | 'cyan'
}

export type ChatThread = {
  id: string
  name: string
  lastMessage: string
  time: string
  unread?: number
  isOnline?: boolean
  lastSeen?: string
  verified?: boolean
  isGroup?: boolean
  groupEmoji?: string
  highlighted?: boolean
  portraitPosition?: string
}

export type ChatMessage =
  | {
      id: string
      type: 'text'
      sender: 'me' | 'them'
      text: string
      time?: string
      read?: boolean
    }
  | {
      id: string
      type: 'invite'
      sender: 'them' | 'me'
      gameTitle: string
      gameEmoji: string
    }
  | { id: string; type: 'date'; label: string }

export type ChatDetail = {
  id: string
  name: string
  verified?: boolean
  isOnline?: boolean
  portraitPosition: string
  lastGame: {
    title: string
    emoji: string
    playedAgo: string
  }
  messages: ChatMessage[]
}

export const chatBottomNavigation: BottomNavItem[] = bottomNavigation.map((item) => ({
  ...item,
  badge: item.id === 'chat' ? 12 : item.badge,
  active: undefined,
}))

export const chatTabs: { id: ChatTabId; label: string; badge?: number; icon?: IconType }[] = [
  { id: 'all', label: 'Tümü', badge: 12 },
  { id: 'online', label: 'Çevrimiçi' },
  { id: 'groups', label: 'Grup Sohbetleri', icon: FiUsers },
  { id: 'invites', label: 'Oyuncu Davetleri', icon: LuGamepad2 },
]

export const onlineUsers: OnlineUser[] = [
  { id: 'zeynep', name: 'Zeynep', portraitPosition: '54% 54%', ring: 'pink' },
  { id: 'mert', name: 'Mert', portraitPosition: '32% 56%', ring: 'cyan' },
  { id: 'ali', name: 'Ali', portraitPosition: '8% 58%', ring: 'cyan' },
  { id: 'damla', name: 'Damla', portraitPosition: '80% 55%', ring: 'cyan' },
]

export const chatThreads: ChatThread[] = [
  {
    id: 'zeynep',
    name: 'Zeynep',
    lastMessage: 'Süper olur! O zaman XOX atarız 💪',
    time: '14:35',
    unread: 1,
    isOnline: true,
    verified: true,
    highlighted: true,
    portraitPosition: '54% 54%',
  },
  {
    id: 'mert',
    name: 'Mert',
    lastMessage: 'Ranked’a geliyor musun?',
    time: '13:12',
    unread: 2,
    isOnline: true,
    portraitPosition: '32% 56%',
  },
  {
    id: 'ali',
    name: 'Ali',
    lastMessage: 'Block Duel lobide bekliyorum',
    time: '12:04',
    lastSeen: '5 dk önce',
    portraitPosition: '8% 58%',
  },
  {
    id: 'damla',
    name: 'Damla',
    lastMessage: 'Sesli sohbete geçelim mi?',
    time: 'Dün',
    isOnline: true,
    verified: true,
    portraitPosition: '80% 55%',
  },
]

/** message-final.png — Zeynep demo konuşması */
export const chatDetails: Record<string, ChatDetail> = {
  zeynep: {
    id: 'zeynep',
    name: 'Zeynep',
    verified: true,
    isOnline: true,
    portraitPosition: '54% 54%',
    lastGame: { title: 'Block Duel', emoji: '🧩', playedAgo: '2 saat önce' },
    messages: [
      { id: 'd1', type: 'date', label: 'Bugün' },
      {
        id: 'm1',
        type: 'text',
        sender: 'them',
        text: 'Harika maçtı! Tekrar oynayalım mı? 🎮',
        time: '14:32',
      },
      {
        id: 'm2',
        type: 'text',
        sender: 'me',
        text: 'Kesinlikle! Sen çok iyiydin 🔥',
        time: '14:33',
        read: true,
      },
      {
        id: 'm3',
        type: 'text',
        sender: 'them',
        text: 'Teşekkürler! 🙏 Bu akşam müsait misin?',
        time: '14:34',
      },
      {
        id: 'm4',
        type: 'text',
        sender: 'me',
        text: 'Evet, 21:00 gibi olur mu?',
        time: '14:35',
        read: true,
      },
      {
        id: 'm5',
        type: 'text',
        sender: 'them',
        text: 'Süper olur! O zaman XOX atarız 💪',
        time: '14:35',
      },
      {
        id: 'm6',
        type: 'invite',
        sender: 'them',
        gameTitle: 'XOX',
        gameEmoji: '⭕',
      },
    ],
  },
}

export function getChatDetail(id: string): ChatDetail | null {
  if (chatDetails[id]) return chatDetails[id]
  const thread = chatThreads.find((t) => t.id === id)
  if (!thread) return null
  return {
    id: thread.id,
    name: thread.name,
    verified: thread.verified,
    isOnline: thread.isOnline,
    portraitPosition: thread.portraitPosition ?? '50% 50%',
    lastGame: { title: 'Block Duel', emoji: '🎮', playedAgo: '3 saat önce' },
    messages: [
      { id: 'd1', type: 'date', label: 'Bugün' },
      {
        id: 'm1',
        type: 'text',
        sender: 'them',
        text: thread.lastMessage,
        time: thread.time,
      },
    ],
  }
}
