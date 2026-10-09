import type { AppNotification } from './types'

/** Geçici sahte liste. Canlı veri gelince kaldırılacak. */
export const initialNotifications: AppNotification[] = [
  {
    id: 'fake-like',
    kind: 'like',
    title: 'Elif seni beğendi',
    body: 'Profiline baktı ve beğeni bıraktı.',
    timeLabel: '2 dk',
    read: false,
    avatarInitial: 'E',
  },
  {
    id: 'fake-match',
    kind: 'match',
    title: 'Deniz ile eşleştin',
    body: 'İkiniz de birbirinizi beğendiniz.',
    timeLabel: '18 dk',
    read: false,
    avatarInitial: 'D',
  },
  {
    id: 'fake-game',
    kind: 'game',
    title: 'Lara oyun daveti gönderdi',
    body: 'Hızlı bir maça çağırıyor.',
    timeLabel: '1 sa',
    read: false,
    avatarInitial: 'L',
  },
  {
    id: 'fake-message',
    kind: 'message',
    title: 'Mert mesaj yazdı',
    body: 'Akşam müsait misin?',
    timeLabel: 'Dün',
    read: true,
    avatarInitial: 'M',
  },
]
