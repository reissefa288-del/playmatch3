import { FiMic, FiPlus, FiSmile } from 'react-icons/fi'
import { motion } from 'framer-motion'

export function MessageInput() {
  return (
    <motion.footer
      className="pm-message-input"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
    >
      <motion.button type="button" className="pm-message-input__side" aria-label="Ekle" whileTap={{ scale: 0.94 }}>
        <FiPlus />
      </motion.button>
      <label className="pm-message-input__field">
        <input type="text" placeholder="Mesajını yaz..." />
        <FiSmile className="pm-message-input__emoji" aria-hidden />
      </label>
      <motion.button type="button" className="pm-message-input__side" aria-label="Sesli mesaj" whileTap={{ scale: 0.94 }}>
        <FiMic />
      </motion.button>
    </motion.footer>
  )
}
