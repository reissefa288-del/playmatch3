/**
 * P11 — service worker precache for shell + LCP warm-start.
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
const swFile = path.join(distDir, 'sw.js')
const manifestFile = path.join(distDir, 'manifest.webmanifest')
const mainFile = path.join(root, 'src', 'main.tsx')
const registerFile = path.join(root, 'src', 'shared', 'registerServiceWorker.ts')
const budgetsFile = path.join(root, 'performance', 'budgets.json')
const headersFile = path.join(root, 'public', '_headers')

const errors = []

function loadMaxPrecacheKb() {
  try {
    return JSON.parse(readFileSync(budgetsFile, 'utf8')).pwa?.maxPrecacheKb ?? 900
  } catch {
    return 900
  }
}

if (!existsSync(registerFile)) {
  errors.push('Missing src/shared/registerServiceWorker.ts')
} else if (!/serviceWorker\.register\(['"]\/sw\.js['"]/.test(readFileSync(registerFile, 'utf8'))) {
  errors.push('registerServiceWorker must register /sw.js')
}

if (!existsSync(mainFile) || !/registerServiceWorker/.test(readFileSync(mainFile, 'utf8'))) {
  errors.push('main.tsx must invoke registerServiceWorker in production')
}

if (!existsSync(manifestFile)) {
  errors.push('dist/manifest.webmanifest missing — add public/manifest.webmanifest')
}

if (!existsSync(swFile)) {
  errors.push('dist/sw.js missing — run build with generateServiceWorker plugin')
} else {
  const swSrc = readFileSync(swFile, 'utf8')
  if (!/PRECACHE=\[/.test(swSrc)) {
    errors.push('sw.js must embed PRECACHE manifest')
  }
  if (!/'navigate'/.test(swSrc)) {
    errors.push('sw.js must handle navigate requests with index.html fallback')
  }

  const match = swSrc.match(/PRECACHE=(\[[\s\S]*?\]);/)
  if (!match) {
    errors.push('sw.js PRECACHE JSON not parseable')
  } else {
    const precache = JSON.parse(match[1])
    const requiredPatterns = [
      /\/index\.html$/,
      /home-shell-.*\.js$/,
      /games-shell-.*\.js$/,
      /match-shell-.*\.js$/,
      /profile-shell-.*\.js$/,
      /\.avif$/,
    ]
    for (const pattern of requiredPatterns) {
      if (!precache.some((url) => pattern.test(url))) {
        errors.push(`PRECACHE missing asset matching ${pattern}`)
      }
    }

    let precacheBytes = 0
    for (const url of precache) {
      const rel = url.replace(/^\//, '')
      const filePath = path.join(distDir, rel)
      if (!existsSync(filePath)) {
        errors.push(`PRECACHE URL not in dist: ${url}`)
        continue
      }
      precacheBytes += statSync(filePath).size
    }

    const maxKb = loadMaxPrecacheKb()
    const precacheKb = precacheBytes / 1024
    if (precacheKb > maxKb) {
      errors.push(`PRECACHE ${precacheKb.toFixed(1)} KB exceeds pwa.maxPrecacheKb ${maxKb}`)
    }
  }
}

if (existsSync(headersFile)) {
  const headers = readFileSync(headersFile, 'utf8')
  if (!/\/sw\.js[\s\S]*must-revalidate/i.test(headers)) {
    errors.push('public/_headers must set must-revalidate for /sw.js')
  }
}

if (errors.length) {
  console.error('PWA precache check failed:\n')
  errors.forEach((line) => console.error(`  • ${line}`))
  process.exit(1)
}

console.log('PWA precache check passed (sw.js shell + LCP assets, manifest, registration).')
