import altinIcon from '../../reference/altın.png'
import elmasIcon from '../../reference/elmas.png'
import type { CurrencyKind, CurrencyPackage } from './types'

export const currencyMeta: Record<
  CurrencyKind,
  { title: string; subtitle: string; icon: string; packages: CurrencyPackage[] }
> = {
  coins: {
    title: 'Altın Satın Al',
    subtitle: 'Günlük görevler, hediyeler ve oyun içi ödüller için altın.',
    icon: altinIcon,
    packages: [
      { id: 'c-500', amount: 500, priceLabel: '₺29,99' },
      {
        id: 'c-1200',
        amount: 1200,
        bonus: 200,
        priceLabel: '₺59,99',
        popular: true,
        badge: 'Popüler',
        tagline: 'En çok tercih edilen',
      },
      {
        id: 'c-2500',
        amount: 2500,
        bonus: 600,
        priceLabel: '₺99,99',
        tagline: 'En iyi değer',
      },
    ],
  },
  gems: {
    title: 'Elmas Satın Al',
    subtitle: 'Süper beğeni, boost ve öncelikli eşleşme için anında kullan.',
    icon: elmasIcon,
    packages: [
      {
        id: 'g-40',
        amount: 40,
        priceLabel: '₺29,99',
        tagline: 'Hızlı başlangıç',
      },
      {
        id: 'g-120',
        amount: 120,
        bonus: 20,
        priceLabel: '₺79,99',
        popular: true,
        badge: 'En popüler',
        tagline: '%17 daha fazla elmas',
      },
      {
        id: 'g-300',
        amount: 300,
        bonus: 60,
        priceLabel: '₺149,99',
        tagline: 'En iyi değer · %20 bonus',
      },
    ],
  },
}
