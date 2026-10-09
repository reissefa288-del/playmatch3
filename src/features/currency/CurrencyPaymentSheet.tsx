import { FiX } from 'react-icons/fi'

type CurrencyPaymentSheetProps = {
  title: string
  amount: number
  bonus?: number
  priceLabel: string
  unit: string
  onBack: () => void
  onPay: () => void
}

export function CurrencyPaymentSheet({
  title,
  amount,
  bonus,
  priceLabel,
  unit,
  onBack,
  onPay,
}: CurrencyPaymentSheetProps) {
  const total = amount + (bonus ?? 0)

  return (
    <>
      <button
        type="button"
        className="pm-currency-pay__backdrop"
        aria-label="Ödemeyi kapat"
        onClick={onBack}
      />
      <div className="pm-currency-pay__viewport">
        <section className="pm-currency-pay" role="dialog" aria-modal="true" aria-labelledby="pm-currency-pay-title">
          <header className="pm-currency-pay__head">
            <div>
              <p>Ödeme</p>
              <h2 id="pm-currency-pay-title">{title}</h2>
            </div>
            <button type="button" className="pm-currency-shop__close" onClick={onBack} aria-label="Geri">
              <FiX />
            </button>
          </header>

          <div className="pm-currency-pay__summary">
            <span>
              {amount.toLocaleString('tr-TR')} {unit}
              {bonus ? ` + ${bonus}` : ''}
            </span>
            <strong>{total.toLocaleString('tr-TR')} {unit}</strong>
            <em>{priceLabel}</em>
          </div>

          <button type="button" className="pm-currency-pay__confirm" onClick={onPay}>
            {priceLabel} öde
          </button>

          <button type="button" className="pm-currency-pay__back" onClick={onBack}>
            Vazgeç
          </button>
        </section>
      </div>
    </>
  )
}
