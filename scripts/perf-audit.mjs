/**
 * Full local performance audit (Faz A).
 *
 * Usage:
 *   npm run perf:audit          # build + bundle budgets
 *   npm run perf:audit:full     # + lighthouse capture + regression check
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function run(label, command, args) {
  console.log(`\n▶ ${label}`)
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: true })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const full = process.argv.includes('--full')

run('Production build', 'npm', ['run', 'build:production'])
run('Production artifacts', 'node', ['scripts/check-production-build.mjs'])
run('Cache headers', 'node', ['scripts/check-cache-headers.mjs'])
run('Compression (brotli)', 'node', ['scripts/check-compression.mjs'])
run('Brotli artifacts (.br)', 'node', ['scripts/check-brotli-artifacts.mjs'])
run('RUM wiring', 'node', ['scripts/check-production-rum.mjs'])
run('PWA precache', 'node', ['scripts/check-pwa-precache.mjs'])
run('Photo pipeline', 'node', ['scripts/check-photo-pipeline.mjs'])
run('Image sources', 'node', ['scripts/check-image-sources.mjs'])
run('Bundle budgets', 'node', ['scripts/check-bundle-budgets.mjs'])
run('Index chunk isolation', 'node', ['scripts/check-index-chunk-isolation.mjs'])
run('Media budgets', 'node', ['scripts/check-media-budgets.mjs'])
run('Runtime timers', 'node', ['scripts/check-runtime-timers.mjs'])
run('CSS paint', 'node', ['scripts/check-css-paint.mjs'])
run('Game canvas', 'node', ['scripts/check-game-canvas.mjs'])
run('Critical preloads', 'node', ['scripts/check-critical-preloads.mjs'])
run('Lighthouse regression', 'node', ['scripts/check-lighthouse-budgets.mjs'])

if (full) {
  run('Lighthouse baseline capture', 'node', ['scripts/lighthouse-baseline.mjs'])
  run('Lighthouse regression check', 'node', ['scripts/check-lighthouse-budgets.mjs'])
} else {
  console.log('\nTip: run `npm run perf:audit:full` to refresh Lighthouse baseline.')
}

console.log('\n▶ Production deploy (P9–P11)')
console.log('  • CDN: public/_headers + performance/nginx.example.conf')
console.log('  • Pre-compress: npm run build:production (writes .br siblings; CI uses this)')
console.log('  • Preview/Lighthouse: brotli_static when Accept-Encoding: br')
console.log('  • RUM p75: set VITE_SENTRY_DSN → Sentry Performance → Web Vitals')
console.log('  • Custom beacons: VITE_RUM_ENDPOINT (5% sample, pagehide flush)')
console.log('  • PWA: dist/sw.js precaches shell + LCP AVIF (repeat-visit warm start)')
console.log('  • Photos: PhotoImage srcset + blur; VITE_CDN_BASE_URL for API CDN')
console.log('  • Lighthouse refresh: npm run perf:audit:full on main after perf changes')

console.log('\n▶ Runtime memory profile (F6)')
console.log('  1. Chrome → Memory: heap snapshot on Home')
console.log('  2. Switch tabs (home → match → games → chat → profile) ×10')
console.log('  3. Second snapshot — heap growth should stay ≤50 MB')
console.log('  4. Performance panel: background tab CPU should stay low while hidden')

console.log('\nPerf audit complete.')
