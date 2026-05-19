type LiveSocialStripProps = {
  activePlayersLabel: string
  waitLabel: string
  tickerLine?: string
  activeFlash?: boolean
  waitFlash?: boolean
  waitPulseFast?: boolean
}

export function LiveSocialStrip({
  activePlayersLabel,
  waitLabel,
  tickerLine,
  activeFlash = false,
  waitFlash = false,
  waitPulseFast = false,
}: LiveSocialStripProps) {
  return (
    <div className="pm-live-strip" role="status" aria-live="polite">
      <span
        className={`pm-live-strip__pulse${waitPulseFast ? ' is-fast' : ''}`}
        aria-hidden
      />
      <span className={`pm-live-strip__stat${activeFlash ? ' is-flash' : ''}`}>{activePlayersLabel}</span>
      <span className="pm-live-strip__sep" aria-hidden>
        ·
      </span>
      <span className={`pm-live-strip__stat${waitFlash ? ' is-flash' : ''}`}>{waitLabel}</span>
      {tickerLine ? (
        <span className="pm-live-strip__ticker-line" aria-hidden>
          {tickerLine}
        </span>
      ) : null}
    </div>
  )
}
