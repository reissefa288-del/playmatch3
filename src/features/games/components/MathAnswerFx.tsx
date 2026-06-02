type MathAnswerFxProps = {
  kind: 'hit' | 'miss'
  accent: 'cyan' | 'pink'
}

/** Cevap kartı doğru / yanlış patlaması (görsel). */
export function MathAnswerFx({ kind, accent }: MathAnswerFxProps) {
  return (
    <span className={`pm-math-answer-fx is-${kind} is-${accent}`} aria-hidden>
      <span className="pm-math-answer-fx__ring" />
      <span className="pm-math-answer-fx__burst" />
      {kind === 'hit'
        ? Array.from({ length: 6 }, (_, i) => (
            <i key={i} className="pm-math-answer-fx__spark" style={{ ['--i' as string]: i }} />
          ))
        : null}
    </span>
  )
}
