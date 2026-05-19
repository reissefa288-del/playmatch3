import type { IconType } from 'react-icons'

type QuickStartAction = {
  id: string
  title: string
  subtitle: string
  icon: IconType
  accent: 'pink' | 'blue'
}

type QuickStartSectionProps = {
  actions: QuickStartAction[]
}

export function QuickStartSection({ actions }: QuickStartSectionProps) {
  return (
    <section className="pm-quick-start">
      <h3>Hizli Baslangic</h3>
      <div className="pm-quick-start__grid">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              type="button"
              className={`pm-quick-action pm-quick-action--${action.accent}`}
            >
              <Icon />
              <div>
                <strong>{action.title}</strong>
                <span>{action.subtitle}</span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
