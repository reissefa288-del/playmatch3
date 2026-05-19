import { motion } from 'framer-motion'
import type { GamesCategory } from '../data'

type CategoryTabsProps = {
  categories: GamesCategory[]
}

export function CategoryTabs({ categories }: CategoryTabsProps) {
  return (
    <section className="pm-games-categories" aria-label="Oyun kategorileri">
      {categories.map((category, index) => (
        <motion.button
          key={category.id}
          type="button"
          className={`pm-games-chip ${category.active ? 'is-active' : ''}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.3 }}
          whileTap={{ scale: 0.965 }}
        >
          {category.label}
        </motion.button>
      ))}
    </section>
  )
}