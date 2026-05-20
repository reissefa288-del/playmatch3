import { FiEye, FiGift, FiHeart, FiMessageCircle, FiShield, FiZap } from 'react-icons/fi'
import { LuCrown } from 'react-icons/lu'
import type { IconType } from 'react-icons'
import { bottomNavigation } from '../home/data'
import type { BottomNavItem } from '../home/types'


export const premiumBottomNavigation: BottomNavItem[] = bottomNavigation

export const premiumHero = {
  title: 'PlayMeet Premium',
  tagline: 'Sınırları kaldır, oyunun tadını çıkar!',
  perks: ['Sınırsız beğeni ve süper güçler', 'Öncelikli eşleşme ve özel rozet'],
  cta: 'Hemen Yükselt',
}

export type PremiumFeature = {
  id: string
  title: string
  description: string
  icon: IconType
  accent: 'pink' | 'violet' | 'gold' | 'cyan'
}

export const premiumFeatures: PremiumFeature[] = [
  {
    id: 'likes',
    title: 'Sınırsız Beğeni',
    description: 'Günlük limit yok, istediğin kadar beğen.',
    icon: FiHeart,
    accent: 'pink',
  },
  {
    id: 'viewers',
    title: 'Görüntüleyenleri Gör',
    description: 'Profilini kimlerin ziyaret ettiğini keşfet.',
    icon: FiEye,
    accent: 'violet',
  },
  {
    id: 'boost',
    title: 'Öne Çıkarıl',
    description: 'Profilin öne çıkarılsın, daha fazla eşleş.',
    icon: FiZap,
    accent: 'cyan',
  },
  {
    id: 'read',
    title: 'Okundu Bilgisi',
    description: 'Mesajların okunup okunmadığını gör.',
    icon: FiMessageCircle,
    accent: 'pink',
  },
  {
    id: 'ads',
    title: 'Reklamsız Deneyim',
    description: 'Kesintisiz, saf oyun ve sohbet keyfi.',
    icon: FiShield,
    accent: 'violet',
  },
  {
    id: 'badge',
    title: 'Özel Rozet',
    description: 'Premium taç rozeti ile öne çık.',
    icon: LuCrown,
    accent: 'gold',
  },
]

export type PremiumPackage = {
  id: string
  duration: string
  price: string
  period?: string
  discount?: string
  popular?: boolean
  perks: string[]
}

export const premiumPackages: PremiumPackage[] = [
  {
    id: '1m',
    duration: '1 Aylık',
    price: '₺119,99',
    period: '/ay',
    perks: ['Tüm premium özellikler', 'Anında aktivasyon'],
  },
  {
    id: '3m',
    duration: '3 Aylık',
    price: '₺299,99',
    discount: '%17 İNDİRİM',
    popular: true,
    perks: ['Tüm premium özellikler', 'En iyi değer', 'Öncelikli destek'],
  },
  {
    id: '12m',
    duration: '12 Aylık',
    price: '₺899,99',
    period: '/ay',
    perks: ['Tüm premium özellikler', 'Yıllık tasarruf'],
  },
]

export const premiumTrust = {
  text: 'Güvenli ödeme • İstediğin zaman iptal et • %100 gizlilik',
}

export const premiumGiftCta = {
  label: 'Premium Hediye Et',
  icon: FiGift,
}
