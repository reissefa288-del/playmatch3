import type { AppNotification } from './types'

export const initialNotifications: AppNotification[] = [
  {
    id: 'n-1',
    kind: 'like',
    title: 'Elif seni beğendi',
    body: 'Profiline baktı — karşılık vermek için keşfete dön.',
    timeLabel: 'Az önce',
    read: false,
    avatarInitial: 'E',
  },
  {
    id: 'n-2',
    kind: 'match',
    title: 'Mert ile eşleştin',
    body: 'Mesaj gönderebilir veya oyuna davet edebilirsin.',
    timeLabel: '2 dk',
    read: false,
    avatarInitial: 'M',
  },
  {
    id: 'n-3',
    kind: 'game',
    title: 'Block Duel daveti',
    body: 'Damla seni lobiye çağırıyor.',
    timeLabel: '8 dk',
    read: true,
    avatarInitial: 'D',
  },
  {
    id: 'n-4',
    kind: 'message',
    title: 'Yeni mesaj — Azra',
    body: '“Bu akşam XOX oynar mıyız?”',
    timeLabel: '15 dk',
    read: true,
    avatarInitial: 'A',
  },
]
