import type { IconType } from 'react-icons'

type QuestCardProps = {
  title: string
  subtitle: string
  cta: string
  icon: IconType
  reward: IconType
}

export function QuestCard({ title, subtitle, cta, icon: Icon, reward: Reward }: QuestCardProps) {
  return (
    <section className="pm-quest-card">
      <div className="pm-quest-card__icon-wrap" aria-hidden>
        <Icon />
        <Reward />
      </div>
      <div className="pm-quest-card__copy">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <button type="button" className="pm-quest-card__action">
        {cta}
      </button>
    </section>
  )
}
