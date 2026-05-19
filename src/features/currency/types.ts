export type CurrencyKind = 'coins' | 'gems'

export type CurrencyPackage = {
  id: string
  amount: number
  bonus?: number
  priceLabel: string
  badge?: string
  popular?: boolean
}
