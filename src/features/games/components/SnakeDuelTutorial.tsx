type Props = {
  onDismiss: () => void
}

const TIPS = [
  'Ok tuşları veya D-pad ile yılanı yönlendir.',
  'Kenardan çıkınca karşı taraftan girersin; sadece kendi gövrene çarpınca yanarsın.',
  'Sarı yem +10 puan ve uzatır.',
  'Parlayan elması yakala: +35 puan, süre sınırlı!',
] as const

export function SnakeDuelTutorial({ onDismiss }: Props) {
  return (
    <div className="pm-snake-tutorial" role="dialog" aria-labelledby="pm-snake-tutorial-title">
      <div className="pm-snake-tutorial__card">
        <p id="pm-snake-tutorial-title" className="pm-snake-tutorial__eyebrow">
          SNAKE DUEL
        </p>
        <h2>Nasıl oynanır?</h2>
        <ul>
          {TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <button type="button" onClick={onDismiss}>
          Başla
        </button>
      </div>
    </div>
  )
}
