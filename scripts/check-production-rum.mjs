/**
 * P10 / ADIM 12.3 — production RUM + Sentry wiring checks.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const mainFile = path.join(root, 'src', 'main.tsx')
const rumFile = path.join(root, 'src', 'shared', 'initProductionMonitoring.ts')
const boundaryFile = path.join(root, 'src', 'components', 'AppErrorBoundary.tsx')
const budgetsFile = path.join(root, 'performance', 'budgets.json')

const errors = []

if (!existsSync(rumFile)) {
  errors.push('Missing src/shared/initProductionMonitoring.ts')
} else {
  const rumSrc = readFileSync(rumFile, 'utf8')
  if (!/DEFAULT_SAMPLE_RATE\s*=\s*0\.05/.test(rumSrc)) {
    errors.push('RUM default sample rate must be 5% (0.05)')
  }
  if (!/VITE_SENTRY_DSN/.test(rumSrc)) {
    errors.push('RUM module must support optional VITE_SENTRY_DSN')
  }
  if (!/enableInp:\s*true/.test(rumSrc)) {
    errors.push('Sentry browserTracingIntegration must enable INP (enableInp: true)')
  }
  if (!/type:\s*'event'/.test(rumSrc) || !/pagehide/.test(rumSrc)) {
    errors.push('RUM must observe event timing and flush INP on pagehide')
  }
  if (!/rateLcp|rateInp|rateCls/.test(rumSrc)) {
    errors.push('RUM must attach good/needs-improvement/poor ratings to vitals')
  }
  if (!/reportReactError/.test(rumSrc)) {
    errors.push('RUM module must export reportReactError for AppErrorBoundary (12.3)')
  }
  if (!/ensureSentry|getClient\(\)/.test(rumSrc)) {
    errors.push('Sentry must init when VITE_SENTRY_DSN is set (independent of RUM sample)')
  }
  if (!/VITE_APP_RELEASE|readRelease/.test(rumSrc)) {
    errors.push('Sentry release tag must use VITE_APP_RELEASE or package version')
  }
}

if (!existsSync(mainFile) || !/initProductionMonitoring/.test(readFileSync(mainFile, 'utf8'))) {
  errors.push('main.tsx must invoke initProductionMonitoring in production')
}

if (!existsSync(boundaryFile) || !/reportReactError/.test(readFileSync(boundaryFile, 'utf8'))) {
  errors.push('AppErrorBoundary must call reportReactError (12.3)')
}

try {
  const budgets = JSON.parse(readFileSync(budgetsFile, 'utf8'))
  if (budgets.production?.rumSampleRate !== 0.05) {
    errors.push('performance/budgets.json production.rumSampleRate must be 0.05')
  }
  const rum = budgets.rum?.targets
  if (!rum || rum.lcpP75Ms !== 2500 || rum.inpP75Ms !== 200) {
    errors.push('performance/budgets.json rum.targets must define lcpP75Ms=2500 and inpP75Ms=200')
  }
} catch {
  errors.push('performance/budgets.json production/rum section missing')
}

if (errors.length) {
  console.error('Production RUM check failed:\n')
  errors.forEach((line) => console.error(`  • ${line}`))
  process.exit(1)
}

console.log('Production RUM check passed (5% sampling, INP, Sentry p75 dashboard via VITE_SENTRY_DSN).')
