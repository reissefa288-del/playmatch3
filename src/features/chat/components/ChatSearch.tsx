import { FiSearch } from 'react-icons/fi'
type ChatSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function ChatSearch({ value, onChange }: ChatSearchProps) {
  return (
    <div
      className="pm-chat-search"
     
     
     
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
    </div>
  )
}
