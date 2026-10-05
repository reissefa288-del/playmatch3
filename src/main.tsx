import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { bootstrapRouteChunks } from './bootstrapRouteChunks'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { loadAppFonts } from './shared/loadAppFonts'
import './index.css'
import App from './App.tsx'
import { ensureDevAutoHomeSession } from './features/auth/devPreviewHome'

if (import.meta.env.DEV) {
  ensureDevAutoHomeSession()
}

if (import.meta.env.PROD) {
  const scheduleMonitoring = () => {
    void import('./shared/initProductionMonitoring').then(({ initProductionMonitoring }) => {
      initProductionMonitoring()
    })
  }
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(scheduleMonitoring, { timeout: 5000 })
  } else {
    window.setTimeout(scheduleMonitoring, 2000)
  }

  const scheduleServiceWorker = () => {
    void import('./shared/registerServiceWorker').then(({ registerServiceWorker }) => {
      registerServiceWorker()
    })
  }
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(scheduleServiceWorker, { timeout: 8000 })
  } else {
    window.setTimeout(scheduleServiceWorker, 3000)
  }
}

if (typeof window !== 'undefined') {
  bootstrapRouteChunks(window.location.pathname)
  void loadAppFonts()
}

const app = (
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
)

createRoot(document.getElementById('root')!).render(
  import.meta.env.PROD ? app : <StrictMode>{app}</StrictMode>,
)
