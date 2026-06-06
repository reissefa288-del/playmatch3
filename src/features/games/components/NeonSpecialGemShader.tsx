import type { SpecialKind } from '../utils/neonCrushEngine'

type Props = {
  kind: SpecialKind
  accent: 'cyan' | 'pink'
}

/** 4lü şerit / 5li prizma — özel taş asset + shader katmanları */
export function NeonSpecialGemShader({ kind, accent }: Props) {
  const tier = kind === 'prism' ? 5 : 4

  return (
    <span
      className={[
        'pm-ncrush-special-asset',
        `is-tier-${tier}`,
        `is-${kind}`,
        `is-${accent}`,
      ].join(' ')}
      aria-hidden
    >
      <i className="pm-ncrush-special-asset__halo" />
      <i className="pm-ncrush-special-asset__vignette" />

      {tier === 4 ? (
        <>
          <i className="pm-ncrush-special-asset__frame" />
          <i className="pm-ncrush-special-asset__bracket pm-ncrush-special-asset__bracket--tl" />
          <i className="pm-ncrush-special-asset__bracket pm-ncrush-special-asset__bracket--br" />
          {kind === 'stripe-h' ? (
            <>
              <i className="pm-ncrush-special-asset__stripe pm-ncrush-special-asset__stripe--core" />
              <i className="pm-ncrush-special-asset__stripe pm-ncrush-special-asset__stripe--glow" />
              <i className="pm-ncrush-special-asset__scan pm-ncrush-special-asset__scan--h" />
            </>
          ) : (
            <>
              <i className="pm-ncrush-special-asset__stripe pm-ncrush-special-asset__stripe--core is-vertical" />
              <i className="pm-ncrush-special-asset__stripe pm-ncrush-special-asset__stripe--glow is-vertical" />
              <i className="pm-ncrush-special-asset__scan pm-ncrush-special-asset__scan--v" />
            </>
          )}
          <span className="pm-ncrush-special-asset__badge is-tier-4">4</span>
        </>
      ) : (
        <>
          <i className="pm-ncrush-special-asset__prism-aura" />
          <i className="pm-ncrush-special-asset__prism-ring" />
          <i className="pm-ncrush-special-asset__prism-core" />
          <i className="pm-ncrush-special-asset__prism-flare" />
          <i className="pm-ncrush-special-asset__prism-spark pm-ncrush-special-asset__prism-spark--a" />
          <i className="pm-ncrush-special-asset__prism-spark pm-ncrush-special-asset__prism-spark--b" />
          <span className="pm-ncrush-special-asset__badge is-tier-5">5</span>
        </>
      )}
    </span>
  )
}
