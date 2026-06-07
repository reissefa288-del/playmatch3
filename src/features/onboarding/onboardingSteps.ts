import type { IconType } from 'react-icons'
import {
  FiCalendar,
  FiCamera,
  FiEdit3,
  FiHeart,
  FiTag,
  FiUser,
} from 'react-icons/fi'

export type OnboardingStepId = 'name' | 'age' | 'match' | 'photo' | 'interests' | 'bio'

export type OnboardingStepMeta = {
  id: OnboardingStepId
  title: string
  subtitle: string
  tip: string
  icon: IconType
}

export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  {
    id: 'name',
    title: 'Adın ne?',
    subtitle: 'Profilinde görünecek isim',
    tip: 'Gerçek adın veya takma adın — sana nasıl hitap edilsin?',
    icon: FiUser,
  },
  {
    id: 'age',
    title: 'Kaç yaşındasın?',
    subtitle: 'PlayMeet yalnızca 18+ kullanıcılar içindir',
    tip: 'Yaşın eşleşme önerilerinde doğru profilleri göstermemize yardımcı olur.',
    icon: FiCalendar,
  },
  {
    id: 'match',
    title: 'Kimlerle eşleşmek istersin?',
    subtitle: 'Tercihini istediğin zaman değiştirebilirsin',
    tip: 'Türkiye genelinde keşif yapabilir, filtreyi sonra güncelleyebilirsin.',
    icon: FiHeart,
  },
  {
    id: 'photo',
    title: 'Fotoğraf ekle',
    subtitle: 'İlk izlenim önemli — en az bir fotoğraf',
    tip: 'Fotoğraflı profiller ortalama 3 kat daha fazla eşleşme alır.',
    icon: FiCamera,
  },
  {
    id: 'interests',
    title: 'İlgi alanların',
    subtitle: 'Tam 4 tane seç — profilinde bunlar görünecek',
    tip: 'Oyun türlerin ve hobilerin ortak zevkli kişilerle eşleşmeni kolaylaştırır.',
    icon: FiTag,
  },
  {
    id: 'bio',
    title: 'Hakkında',
    subtitle: 'Kendini kısaca tanıt',
    tip: 'Kısa ve samimi bir bio sohbet başlatmayı çok kolaylaştırır.',
    icon: FiEdit3,
  },
]

export const BIO_SUGGESTIONS = [
  'Rekabetçi oyuncu, duo arıyorum 🎮',
  'Sohbet + casual oyunlar, yeni insanlarla tanışmayı seviyorum',
  'Gece kuşu gamer — XOX ve düello oyunları favorim',
  'Takım oyunları ve eğlenceli maçlar için buradayım ✨',
] as const

export const INTEREST_EMOJI: Record<string, string> = {
  Gamer: '🎮',
  Müzik: '🎵',
  Seyahat: '✈️',
  Film: '🎬',
  Spor: '⚽',
  FPS: '🎯',
  Strateji: '♟️',
  Sohbet: '💬',
  'E-Spor': '🏆',
  Anime: '🌸',
  Kitap: '📚',
  Fitness: '💪',
  MOBA: '⚔️',
  'Battle Royale': '🪂',
  Indie: '🕹️',
  Cosplay: '🎭',
}

export function matchPreferenceLabel(id: string): string {
  if (id === 'female') return 'Kadınlar'
  if (id === 'male') return 'Erkekler'
  return 'Her ikisi'
}
