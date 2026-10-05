import type { GamesCategory } from '../data'

type CategoryTabsProps = {
  categories: GamesCategory[]
}

export function CategoryTabs({ categories }: CategoryTabsProps) {
  return (
    <section className="pm-games-categories" aria-label="Oyun kategorileri">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`pm-games-chip ${category.active ? 'is-active' : ''}`}
         
         
         
         
        >
          {category.label}
        </button>
      ))}
    </section>
  )
}