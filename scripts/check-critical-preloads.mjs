/**
 * Ensures production index.html includes route-aware critical preloads (P4).
 *
 * Usage: node scripts/check-critical-preloads.mjs
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const indexFile = path.join(root, 'dist', 'index.html')

const FORBIDDEN_STATIC = [
  { label: 'no static MatchScreen modulepreload', pattern: /rel="modulepreload"[^>]+MatchScreen/i },
  { label: 'no static ProfileScreen modulepreload', pattern: /rel="modulepreload"[^>]+ProfileScreen/i },
  { label: 'no static PremiumScreen modulepreload', pattern: /rel="modulepreload"[^>]+PremiumScreen/i },
  { label: 'no static GamesScreenBody modulepreload', pattern: /rel="modulepreload"[^>]+GamesScreenBody/i },
  { label: 'no static games-shell modulepreload', pattern: /rel="modulepreload"[^>]+games-shell/i },
  { label: 'no static profile-shell modulepreload', pattern: /rel="modulepreload"[^>]+profile-shell/i },
  { label: 'no static match-shell modulepreload', pattern: /rel="modulepreload"[^>]+match-shell/i },
  { label: 'no static tab image preloads', pattern: /rel="preload"[^>]+as="image"/i },
]

const ROUTE_MANIFEST_CHECKS = [
  ['Home shell preload in bootstrap', /home-shell-[^"']+\.js/],
  ['games-shell preload in bootstrap', /games-shell-[^"']+\.js/],
  ['profile-shell preload in bootstrap', /profile-shell-[^"']+\.js/],
  ['match-shell preload in bootstrap', /match-shell-[^"']+\.js/],
  ['ChatScreen preload in bootstrap', /ChatScreen-[^"']+\.js/],
  ['PremiumScreen preload in bootstrap', /PremiumScreen-[^"']+\.js/],
]

function extractBootstrap(html) {
  const match = html.match(/<script id="pm-route-preloads">([\s\S]*?)<\/script>/)
  return match?.[1] ?? null
}

function main() {
  if (!existsSync(indexFile)) {
    console.error('dist/index.html not found — run `npm run build` first.')
    process.exit(1)
  }

  const html = readFileSync(indexFile, 'utf8')
  const failures = []
  const bootstrap = extractBootstrap(html)

  console.log('Critical preload check\n')

  if (!bootstrap) {
    failures.push('Missing route preload bootstrap script')
    console.log('  ✗ route preload bootstrap script')
  } else {
    console.log('  OK route preload bootstrap script')
  }

  if (!/rel="preload"[^>]+as="font"[^>]+woff2/i.test(html)) {
    failures.push('Missing Inter font preload')
    console.log('  ✗ Inter font woff2')
  } else {
    console.log('  OK Inter font woff2')
  }

  for (const { label, pattern } of FORBIDDEN_STATIC) {
    const hit = pattern.test(html)
    console.log(`  ${hit ? '✗' : 'OK'} ${label}`)
    if (hit) failures.push(label)
  }

  if (!bootstrap) {
    failures.push('Could not read route preload bootstrap')
    console.log('  ✗ route preload bootstrap body')
  } else {
    for (const [label, pattern] of ROUTE_MANIFEST_CHECKS) {
      const ok = pattern.test(bootstrap)
      console.log(`  ${ok ? 'OK' : '✗'} ${label}`)
      if (!ok) failures.push(label)
    }
  }

  const styleEnd = html.indexOf('</style>')
  const bootstrapPos = html.indexOf('id="pm-route-preloads"')
  if (styleEnd >= 0 && bootstrapPos >= 0 && bootstrapPos < styleEnd) {
    failures.push('Route bootstrap should run before Vite modulepreloads')
    console.log('  ✗ route bootstrap precedes Vite chunks')
  } else if (bootstrapPos >= 0) {
    console.log('  OK route bootstrap precedes Vite chunks')
  }

  if (failures.length) {
    console.error('\nFailures:')
    failures.forEach((line) => console.error(`  ✗ ${line}`))
    process.exit(1)
  }

  console.log('\nCritical preload check passed.')
}

main()
