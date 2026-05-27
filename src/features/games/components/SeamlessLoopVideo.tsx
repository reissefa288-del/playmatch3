import { useEffect, useRef, useState, type CSSProperties } from 'react'

type SeamlessLoopVideoProps = {
  className?: string
  src: string
  /** Döngü sonuna yaklaşınca çapraz geçiş süresi (sn) */
  crossfadeSec?: number
}

const MIN_DURATION = 0.5

function waitEvent(el: HTMLVideoElement, name: keyof HTMLMediaElementEventMap): Promise<void> {
  return new Promise((resolve) => {
    if (name === 'loadedmetadata' && el.readyState >= HTMLMediaElement.HAVE_METADATA) {
      resolve()
      return
    }
    if (name === 'canplay' && el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      resolve()
      return
    }
    if (name === 'canplaythrough' && el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      resolve()
      return
    }
    el.addEventListener(name, () => resolve(), { once: true })
  })
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const t = window.setTimeout(() => resolve(null), ms)
    p.then(
      (v) => {
        window.clearTimeout(t)
        resolve(v)
      },
      () => {
        window.clearTimeout(t)
        resolve(null)
      },
    )
  })
}

async function seekTo(el: HTMLVideoElement, time: number): Promise<void> {
  if (Math.abs(el.currentTime - time) < 0.03 && el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return
  }
  el.currentTime = time
  await waitEvent(el, 'seeked')
}

function scheduleFrame(el: HTMLVideoElement, cb: () => void): number {
  if ('requestVideoFrameCallback' in el) {
    return el.requestVideoFrameCallback(cb)
  }
  return requestAnimationFrame(cb) as unknown as number
}

function cancelFrame(el: HTMLVideoElement, id: number): void {
  if ('cancelVideoFrameCallback' in el) {
    el.cancelVideoFrameCallback(id)
  } else {
    cancelAnimationFrame(id)
  }
}

/**
 * İki video öğesi + çapraz geçiş — native `loop` sıçramasını gizler.
 * Zamanlama: requestVideoFrameCallback (yoksa rAF), seeked sonrası oynatma.
 */
export function SeamlessLoopVideo({
  className,
  src,
  crossfadeSec = 0.52,
}: SeamlessLoopVideoProps) {
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState<'a' | 'b'>('a')
  const activeRef = useRef<'a' | 'b'>('a')
  const cyclingRef = useRef(false)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const a = videoARef.current
    const b = videoBRef.current
    if (!a || !b) return

    let disposed = false
    let frameId = 0
    let fadeTimer = 0

    const configure = (v: HTMLVideoElement) => {
      v.muted = true
      v.playsInline = true
      v.preload = 'auto'
      v.disablePictureInPicture = true
      v.controls = false
    }

    configure(a)
    configure(b)

    const outgoing = (): HTMLVideoElement => (activeRef.current === 'a' ? a : b)
    const incoming = (): HTMLVideoElement => (activeRef.current === 'a' ? b : a)

    const shouldCrossfade = (from: HTMLVideoElement): boolean => {
      const duration = from.duration
      if (!Number.isFinite(duration) || duration < MIN_DURATION) return false
      const fadeSec = Math.min(crossfadeSec, duration * 0.42)
      return from.currentTime >= duration - fadeSec - 0.04
    }

    const beginCrossfade = async () => {
      if (disposed || cyclingRef.current) return

      const from = outgoing()
      const to = incoming()
      if (!shouldCrossfade(from)) return

      cyclingRef.current = true
      const duration = from.duration
      const fadeSec = Math.min(crossfadeSec, duration * 0.42)

      try {
        to.pause()
        await seekTo(to, 0)
        await to.play()

        const next: 'a' | 'b' = activeRef.current === 'a' ? 'b' : 'a'
        activeRef.current = next
        setActive(next)

        window.clearTimeout(fadeTimer)
        fadeTimer = window.setTimeout(() => {
          if (disposed) return
          from.pause()
          void seekTo(from, 0)
          cyclingRef.current = false
        }, Math.round(fadeSec * 1000))
      } catch {
        cyclingRef.current = false
      }
    }

    const onEnded = () => {
      void beginCrossfade()
    }

    const tick = () => {
      if (disposed) return
      const leader = outgoing()
      if (shouldCrossfade(leader)) {
        void beginCrossfade()
      }
      frameId = scheduleFrame(leader, tick)
    }

    const boot = async () => {
      cyclingRef.current = false
      a.pause()
      b.pause()
      await withTimeout(Promise.all([seekTo(a, 0), seekTo(b, 0)]), 1500)

      // `canplaythrough` bazı ortamlarda hiç gelmeyebilir; hızlı başlat.
      await withTimeout(Promise.all([waitEvent(a, 'loadedmetadata'), waitEvent(b, 'loadedmetadata')]), 2500)
      await withTimeout(Promise.all([waitEvent(a, 'canplay'), waitEvent(b, 'canplay')]), 3500)

      if (disposed) return

      activeRef.current = 'a'
      setActive('a')

      try {
        await a.play()
      } catch {
        /* autoplay */
      }

      b.pause()
      void withTimeout(seekTo(b, 0), 1200)

      a.addEventListener('ended', onEnded)
      b.addEventListener('ended', onEnded)
      frameId = scheduleFrame(a, tick)
    }

    void boot()

    return () => {
      disposed = true
      cyclingRef.current = false
      window.clearTimeout(fadeTimer)
      cancelFrame(a, frameId)
      cancelFrame(b, frameId)
      a.removeEventListener('ended', onEnded)
      b.removeEventListener('ended', onEnded)
      a.pause()
      b.pause()
    }
  }, [src, crossfadeSec])

  const rootClass = `pm-seamless-loop-video ${className ?? ''}`.trim()

  return (
    <div
      className={rootClass}
      style={{ '--pm-seamless-fade': `${crossfadeSec}s` } as CSSProperties}
    >
      <video
        ref={videoARef}
        className={`pm-seamless-loop-video__el ${active === 'a' ? 'is-active' : ''}`}
        src={src}
        muted
        playsInline
        preload="auto"
        tabIndex={-1}
        aria-hidden
      />
      <video
        ref={videoBRef}
        className={`pm-seamless-loop-video__el ${active === 'b' ? 'is-active' : ''}`}
        src={src}
        muted
        playsInline
        preload="auto"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  )
}
