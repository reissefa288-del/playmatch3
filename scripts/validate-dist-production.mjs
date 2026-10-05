/**
 * ADIM 1.2 — production dist smoke: icons, assetlinks, sw, brotli, index.html.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
const errors = []
const warnings = []

function mustExist(relativePath, label) {
  const full = path.join(distDir, relativePath)
  if (!existsSync(full)) {
    errors.push(`${label} eksik: dist/${relativePath}`)
    return null
  }
  return full
}

function minBytes(relativePath, min, label) {
  const full = mustExist(relativePath, label)
  if (!full) return
  const size = statSync(full).size
  if (size < min) {
    errors.push(`${label} çok küçük (${size} B < ${min} B): dist/${relativePath}`)
  }
}

function readDistJson(relativePath) {
  const full = mustExist(relativePath, 'JSON')
  if (!full) return null
  try {
    return JSON.parse(readFileSync(full, 'utf8'))
  } catch {
    errors.push(`Geçersiz JSON: dist/${relativePath}`)
    return null
  }
}

function runCheck(name, script) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', script)], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    errors.push(`${name} başarısız${output ? `:\n${output}` : ''}`)
  } else {
    console.log(`✓ ${name}`)
  }
}

if (!existsSync(distDir)) {
  console.error('dist/ yok — önce `npm run build:production` çalıştır.')
  process.exit(1)
}

mustExist('index.html', 'index.html')
mustExist('manifest.webmanifest', 'manifest.webmanifest')
mustExist('sw.js', 'service worker')
mustExist('favicon.svg', 'favicon')

for (const icon of ['icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png']) {
  minBytes(icon, 512, 'PWA ikon')
}

mustExist('.well-known/assetlinks.json', 'TWA assetlinks')

const manifest = readDistJson('manifest.webmanifest')
if (manifest) {
  if (manifest.display !== 'standalone') {
    errors.push('manifest.webmanifest display "standalone" olmalı')
  }
  for (const icon of manifest.icons ?? []) {
    const src = String(icon.src ?? '').replace(/^\//, '')
    if (src && !existsSync(path.join(distDir, src))) {
      errors.push(`manifest ikonu dist içinde yok: ${icon.src}`)
    }
  }
}

const assetlinks = readDistJson('.well-known/assetlinks.json')
if (assetlinks) {
  const entry = assetlinks[0]
  const pkg = entry?.target?.package_name
  const fingerprints = entry?.target?.sha256_cert_fingerprints ?? []
  if (pkg !== 'app.playmeet.twa') {
    errors.push(`assetlinks package_name "app.playmeet.twa" olmalı (şu an: ${pkg ?? 'yok'})`)
  }
  if (!fingerprints.length) {
    errors.push('assetlinks sha256_cert_fingerprints boş')
  } else if (String(fingerprints[0]).includes('REPLACE_WITH')) {
    warnings.push('assetlinks SHA-256 placeholder — TWA için sen dolduracaksın')
  }
}

const indexPath = path.join(distDir, 'index.html')
if (existsSync(indexPath)) {
  const indexHtml = readFileSync(indexPath, 'utf8')
  if (!/manifest\.webmanifest/.test(indexHtml)) {
    errors.push('index.html manifest.webmanifest linki eksik')
  }
  if (/\/src\/main\.tsx/.test(indexHtml)) {
    errors.push('index.html dev entry (/src/main.tsx) içeriyor — production build hatalı')
  }
  if (!/type="module"/.test(indexHtml)) {
    errors.push('index.html module script tag eksik')
  }
}

const swPath = path.join(distDir, 'sw.js')
if (existsSync(swPath)) {
  const sw = readFileSync(swPath, 'utf8')
  if (!/self\.addEventListener\(['"]install['"]/.test(sw)) {
    errors.push('sw.js install handler eksik')
  }
  if (!/self\.addEventListener\(['"]fetch['"]/.test(sw)) {
    errors.push('sw.js fetch handler eksik')
  }
}

console.log('Dist statik dosya kontrolleri...')
runCheck('Production build (source map)', 'check-production-build.mjs')
runCheck('Brotli artifacts', 'check-brotli-artifacts.mjs')
runCheck('PWA precache (sw.js)', 'check-pwa-precache.mjs')

if (errors.length) {
  console.error('\nDist production doğrulama BAŞARISIZ:\n')
  for (const error of errors) console.error(' -', error)
  process.exit(1)
}

console.log('\nDist production doğrulaması geçti (icons, assetlinks, sw, brotli).')
for (const warning of warnings) console.warn('UYARI:', warning)
