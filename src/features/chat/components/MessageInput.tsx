import { useState, type FormEvent } from 'react'
import { FiMic, FiPlus, FiSmile } from 'react-icons/fi'

type MessageInputProps = {
  onSend: (text: string) => void | Promise<void>
  disabled?: boolean
  sending?: boolean
}

export function MessageInput({ onSend, disabled = false, sending = false }: MessageInputProps) {
  const [value, setValue] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const text = value.trim()
    if (!text || disabled || sending) return
    setValue('')
    await onSend(text)
  }

  return (
    <form className="pm-message-input" onSubmit={handleSubmit}>
      <button type="button" className="pm-message-input__side" aria-label="Ekle">
        <FiPlus />
      </button>
      <label className="pm-message-input__field">
        <input
          type="text"
          placeholder="Mesajını yaz..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={disabled || sending}
        />
        <FiSmile className="pm-message-input__emoji" aria-hidden />
      </label>
      <button
        type="submit"
        className="pm-message-input__side"
        aria-label="Mesaj gönder"
        disabled={disabled || sending || !value.trim()}
      >
        <FiMic />
      </button>
    </form>
  )
}
