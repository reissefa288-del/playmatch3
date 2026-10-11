export type AreaNoticeKind = 'like' | 'super' | 'match' | 'warn'

export type AreaNoticePayload = {
  id: number
  kind: AreaNoticeKind
  title: string
  note?: string
}

const MARKS: Record<AreaNoticeKind, string> = {
  like: 'LIKE',
  super: 'SUPER LIKE',
  match: 'MATCH',
  warn: 'LİMİT',
}

type AreaNoticeProps = {
  notice: AreaNoticePayload | null
  onDismiss: () => void
}

export function AreaNotice({ notice, onDismiss }: AreaNoticeProps) {
  if (!notice) return null

  return (
    <div className="pm-area-notice-host">
      <div key={notice.id} className={`pm-area-notice pm-area-notice--${notice.kind}`} role="status">
        <p className="pm-area-notice__title">{notice.title}</p>
        <div className="pm-area-notice__meta">
          <span className="pm-area-notice__mark" aria-hidden>
            {MARKS[notice.kind]}
          </span>
          {notice.note ? <p className="pm-area-notice__note">{notice.note}</p> : null}
        </div>
        <button type="button" className="pm-area-notice__dismiss" aria-label="Bildirimi kapat" onClick={onDismiss} />
      </div>
    </div>
  )
}
