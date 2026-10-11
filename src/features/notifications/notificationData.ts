import type { AppNotification } from './types'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import denizPortrait from './assets/deniz.jpg'
import laraPortrait from './assets/lara.jpg'

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
    avatarSrc: FAKE_PORTRAIT_FEMALE,
    avatarPosition: '50% 16%',
  },
  {
    id: 'fake-match',
    kind: 'match',
    title: 'Deniz ile eşleştin',
    body: 'İkiniz de birbirinizi beğendiniz.',
    timeLabel: '18 dk',
    read: false,
    avatarInitial: 'D',
    avatarSrc: denizPortrait,
    avatarPosition: '50% 28%',
  },
  {
    id: 'fake-game',
    kind: 'game',
    title: 'Lara oyun daveti gönderdi',
    body: 'Hızlı bir maça çağırıyor.',
    timeLabel: '1 sa',
    read: false,
    avatarInitial: 'L',
    avatarSrc: laraPortrait,
    avatarPosition: '42% 32%',
  },
  {
    id: 'fake-message',
    kind: 'message',
    title: 'Mert mesaj yazdı',
    body: 'Akşam müsait misin?',
    timeLabel: 'Dün',
    read: true,
    avatarInitial: 'M',
    avatarSrc: FAKE_PORTRAIT_MALE,
    avatarPosition: '50% 12%',
  },
]
