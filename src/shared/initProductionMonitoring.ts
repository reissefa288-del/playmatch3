/** P10 / ADIM 12.3 — production RUM (5% sample) + Sentry errors & Web Vitals. */

type WebVitalName = 'LCP' | 'CLS' | 'INP'

type WebVitalMetric = {
  name: WebVitalName
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

const DEFAULT_SAMPLE_RATE = 0.05

function readSampleRate(): number {
  const raw = import.meta.env.VITE_RUM_SAMPLE_RATE
  if (raw == null || raw === '') return DEFAULT_SAMPLE_RATE
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : DEFAULT_SAMPLE_RATE
}

function readRelease(): string | undefined {
  const release = import.meta.env.VITE_APP_RELEASE
  return typeof release === 'string' && release.length > 0 ? release : undefined
}

function rateLcp(ms: number): WebVitalMetric['rating'] {
  return ms <= 2500 ? 'good' : ms <= 4000 ? 'needs-improvement' : 'poor'
}

function rateInp(ms: number): WebVitalMetric['rating'] {
  return ms <= 200 ? 'good' : ms <= 500 ? 'needs-improvement' : 'poor'
}

function rateCls(value: number): WebVitalMetric['rating'] {
  return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
}

function reportMetric(metric: WebVitalMetric) {
  if (import.meta.env.DEV) {
    console.info(`[rum] ${metric.name}`, metric.value, metric.rating)
  }

  const endpoint = import.meta.env.VITE_RUM_ENDPOINT
  if (endpoint && typeof navigator.sendBeacon === 'function') {
    navigator.sendBeacon(
      endpoint,
      JSON.stringify({
        ...metric,
        path: window.location.pathname,
        ts: Date.now(),
      }),
    )
  }
}

function observeWebVitals() {
  let lcpValue: number | null = null
  let clsValue = 0
  let inpValue = 0

  const flushSession = () => {
    if (lcpValue != null) {
      reportMetric({ name: 'LCP', value: lcpValue, rating: rateLcp(lcpValue) })
    }
    reportMetric({ name: 'CLS', value: clsValue, rating: rateCls(clsValue) })
    if (inpValue > 0) {
      reportMetric({ name: 'INP', value: inpValue, rating: rateInp(inpValue) })
    }
  }

  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1) as PerformanceEntry & { renderTime?: number; loadTime?: number }
      if (!last) return
      lcpValue = last.renderTime ?? last.loadTime ?? last.startTime
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    window.addEventListener('pagehide', () => lcpObserver.disconnect(), { once: true })
  } catch {
    /* unsupported */
  }

  try {
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
          clsValue += (entry as PerformanceEntry & { value?: number }).value ?? 0
        }
      }
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
    window.addEventListener(
      'pagehide',
      () => {
        clsObserver.disconnect()
      },
      { once: true },
    )
  } catch {
    /* unsupported */
  }

  try {
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEventTiming[]) {
        if (entry.duration > 0) {
          inpValue = Math.max(inpValue, entry.duration)
        }
      }
    })
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit)
    window.addEventListener(
      'pagehide',
      () => {
        inpObserver.disconnect()
      },
      { once: true },
    )
  } catch {
    /* unsupported */
  }

  window.addEventListener('pagehide', flushSession, { once: true })
}

let sentryReady: Promise<void> | null = null

async function initSentry(dsn: string, tracesSampleRate: number) {
  const Sentry = await import('@sentry/react')
  if (Sentry.getClient()) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: readRelease(),
    tracesSampleRate,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    integrations: [
      Sentry.browserTracingIntegration({
        enableInp: true,
      }),
    ],
    ignoreErrors: ['ResizeObserver loop limit exceeded', 'ResizeObserver loop completed with undelivered notifications'],
  })
}

function ensureSentry(tracesSampleRate: number): Promise<void> | null {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (typeof dsn !== 'string' || dsn.length === 0) return null

  sentryReady ??= initSentry(dsn, tracesSampleRate)
  return sentryReady
}

/** React error boundary → Sentry (production, DSN ayarlıysa). */
export function reportReactError(error: Error, componentStack?: string | null) {
  if (!import.meta.env.PROD) return

  const pending = ensureSentry(readSampleRate())
  if (!pending) return

  void pending.then(async () => {
    const Sentry = await import('@sentry/react')
    Sentry.captureException(error, {
      contexts: componentStack ? { react: { componentStack } } : undefined,
    })
  })
}

export function initProductionMonitoring() {
  if (!import.meta.env.PROD) return

  const sampleRate = readSampleRate()
  void ensureSentry(sampleRate)

  if (Math.random() > sampleRate) return
  observeWebVitals()
}
