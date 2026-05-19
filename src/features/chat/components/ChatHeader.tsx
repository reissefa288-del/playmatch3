import { motion } from 'framer-motion'

export function ChatHeader() {
  return (
    <motion.header
      className="pm-chat-header"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1>Sohbet</h1>
    </motion.header>
  )
}
