import { useEffect, useRef } from 'react'

export type AreaStampKind = 'pass' | 'like' | 'super'

type AreaStampProps = {
  kind: AreaStampKind
  onDone: () => void
}

const WORDS = {
  pass: 'NOPE',
  like: 'LIKE',
  super: 'SUPER LIKE',
} as const

export function AreaStamp({ kind, onDone }: AreaStampProps) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const timer = window.setTimeout(() => onDoneRef.current(), 880)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className={`pm-area-stamp pm-area-stamp--${kind}`} aria-hidden>
      <span className="pm-area-stamp__word">{WORDS[kind]}</span>
    </div>
  )
}
