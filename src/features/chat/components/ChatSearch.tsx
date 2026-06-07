import { FiSearch } from 'react-icons/fi'
import { motion } from 'framer-motion'

type ChatSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function ChatSearch({ value, onChange }: ChatSearchProps) {
  return (
    <motion.div
      className="pm-chat-search"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04, duration: 0.4 }}
    >
      <label className="pm-chat-search__field">
        <FiSearch aria-hidden />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Kişi veya mesaj ara..."
          aria-label="Kişi veya mesaj ara"
        />
      </label>
    </motion.div>
  )
}
