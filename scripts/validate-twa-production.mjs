/**
 * ADIM 2.1 — TWA manifest + assetlinks + PWA manifest uyumu.
 */
import fs from 'node:fs'
import path from 'node:path'
import { isValidSha256Fingerprint } from './twa-fingerprint-utils.mjs'

const root = path.resolve(import.meta.dirname, '..')
const errors = []
const warnings = []

const PACKAGE_ID = 'app.playmeet.twa'
const THEME = '#060818'

function mustExist(relativePath, label) {
  const full = path.join(root, relativePath)
  if (!fs.existsSync(full)) {
    errors.push(`${label} eksik: ${relativePath}`)
    return null
  }
  return full
}

function readJson(relativePath) {
  const full = mustExist(relativePath, 'JSON')
  if (!full) return null
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'))
  } catch {
    errors.push(`Geçersiz JSON: ${relativePath}`)
    return null
  }
}

function hostFromUrl(url) {
  try {
    return new URL(url).host
  } catch {
    return ''
  }
}

mustExist('android/twa-manifest.json', 'TWA manifest')
mustExist('android/twa-host.json', 'TWA host config')
mustExist('public/manifest.webmanifest', 'PWA manifest')
mustExist('public/.well-known/assetlinks.json', 'assetlinks')

const pwa = readJson('public/manifest.webmanifest')
const twa = readJson('android/twa-manifest.json')
const assetlinks = readJson('public/.well-known/assetlinks.json')
const hostConfig = readJson('android/twa-host.json')

if (twa && hostConfig) {
  if (twa.host !== hostConfig.host) {
    errors.push(
      `twa-manifest host (${twa.host}) ≠ twa-host.json (${hostConfig.host}) — npm run twa:sync-host`,
    )
  }

  if (twa.packageId !== PACKAGE_ID) {
    errors.push(`twa-manifest packageId "${PACKAGE_ID}" olmalı`)
  }

  const requiredTwa = [
    'name',
    'launcherName',
    'display',
    'themeColor',
    'backgroundColor',
    'startUrl',
    'iconUrl',
    'maskableIconUrl',
    'webManifestUrl',
    'orientation',
  ]
  for (const key of requiredTwa) {
    if (twa[key] == null || twa[key] === '') {
      errors.push(`twa-manifest.${key} eksik`)
    }
  }

  if (twa.display !== 'standalone') errors.push('twa-manifest display "standalone" olmalı')
  if (twa.orientation !== 'portrait') errors.push('twa-manifest orientation "portrait" olmalı')
  if (twa.themeColor?.toLowerCase() !== THEME) warnings.push(`twa-manifest themeColor ${THEME} değil`)
  if (twa.backgroundColor?.toLowerCase() !== THEME) warnings.push(`twa-manifest backgroundColor ${THEME} değil`)
  if (twa.startUrl !== '/') errors.push('twa-manifest startUrl "/" olmalı')
  if (twa.fallbackType !== 'customtabs') warnings.push('twa-manifest fallbackType "customtabs" önerilir (Google Sign-In)')

  const host = twa.host
  for (const [field, url] of [
    ['iconUrl', twa.iconUrl],
    ['maskableIconUrl', twa.maskableIconUrl],
    ['webManifestUrl', twa.webManifestUrl],
  ]) {
    const urlHost = hostFromUrl(url)
    if (urlHost !== host) {
      errors.push(`twa-manifest.${field} host uyuşmuyor (${urlHost} ≠ ${host})`)
    }
    if (!url?.startsWith('https://')) {
      errors.push(`twa-manifest.${field} https:// ile başlamalı`)
    }
  }

  if (twa.iconUrl && !twa.iconUrl.endsWith('/icons/icon-512.png')) {
    errors.push('twa-manifest iconUrl /icons/icon-512.png olmalı')
  }
  if (twa.maskableIconUrl && !twa.maskableIconUrl.endsWith('/icons/icon-maskable-512.png')) {
    errors.push('twa-manifest maskableIconUrl /icons/icon-maskable-512.png olmalı')
  }
  if (twa.webManifestUrl && !twa.webManifestUrl.endsWith('/manifest.webmanifest')) {
    errors.push('twa-manifest webManifestUrl /manifest.webmanifest olmalı')
  }

  if (!twa.appVersionName) errors.push('twa-manifest appVersionName eksik')
  if (!Number.isInteger(twa.appVersionCode) || twa.appVersionCode < 1) {
    errors.push('twa-manifest appVersionCode pozitif integer olmalı')
  }

  if (host === 'playmeet.app') {
    warnings.push('host hâlâ playmeet.app — custom domain yoksa Firebase .web.app host yaz (twa-host.json)')
  }
}

if (pwa && twa) {
  if (pwa.name !== twa.name) warnings.push(`PWA name (${pwa.name}) ≠ TWA name (${twa.name})`)
  if (pwa.short_name !== twa.launcherName) {
    warnings.push(`PWA short_name (${pwa.short_name}) ≠ TWA launcherName (${twa.launcherName})`)
  }
  if (pwa.display !== twa.display) errors.push('PWA display ile TWA display uyuşmuyor')
  if (pwa.orientation !== twa.orientation) errors.push('PWA orientation ile TWA orientation uyuşmuyor')
  if (pwa.theme_color?.toLowerCase() !== twa.themeColor?.toLowerCase()) {
    warnings.push('PWA theme_color ile TWA themeColor uyuşmuyor')
  }
  if (pwa.background_color?.toLowerCase() !== twa.backgroundColor?.toLowerCase()) {
    warnings.push('PWA background_color ile TWA backgroundColor uyuşmuyor')
  }
  if (pwa.start_url !== twa.startUrl) warnings.push('PWA start_url ile TWA startUrl uyuşmuyor')

  const pwaIcons = new Set((pwa.icons ?? []).map((i) => i.src))
  if (!pwaIcons.has('/icons/icon-512.png')) errors.push('PWA manifest /icons/icon-512.png eksik')
  if (!pwaIcons.has('/icons/icon-maskable-512.png')) {
    errors.push('PWA manifest maskable /icons/icon-maskable-512.png eksik')
  }
}

if (assetlinks) {
  if (!Array.isArray(assetlinks) || assetlinks.length === 0) {
    errors.push('assetlinks.json boş dizi olmamalı')
  } else {
    const entry = assetlinks[0]
    const relations = entry?.relation ?? []
    if (!relations.includes('delegate_permission/common.handle_all_urls')) {
      errors.push('assetlinks relation delegate_permission/common.handle_all_urls eksik')
    }
    const target = entry?.target ?? {}
    if (target.namespace !== 'android_app') {
      errors.push('assetlinks target.namespace "android_app" olmalı')
    }
    if (target.package_name !== PACKAGE_ID) {
      errors.push(`assetlinks package_name "${PACKAGE_ID}" olmalı`)
    }
    const fps = target.sha256_cert_fingerprints ?? []
    if (!fps.length) {
      errors.push('assetlinks sha256_cert_fingerprints boş')
    } else if (String(fps[0]).includes('REPLACE_WITH')) {
      warnings.push('assetlinks SHA-256 placeholder — ADIM 2.2: keystore fingerprint ekle')
    } else if (!isValidSha256Fingerprint(fps[0])) {
      errors.push('assetlinks SHA-256 formatı geçersiz (AA:BB:... veya 64 hex)')
    } else if (
      Array.isArray(twa?.fingerprints) &&
      twa.fingerprints.length &&
      twa.fingerprints[0] !== fps[0]
    ) {
      errors.push('assetlinks fingerprint ≠ twa-manifest fingerprints — npm run twa:apply-fingerprint')
    }
  }
}

for (const icon of ['public/icons/icon-512.png', 'public/icons/icon-maskable-512.png']) {
  mustExist(icon, 'TWA ikon')
}

if (errors.length) {
  console.error('TWA doğrulama BAŞARISIZ:\n')
  for (const error of errors) console.error(' -', error)
  process.exit(1)
}

console.log('TWA manifest / assetlinks şablon doğrulaması geçti (ADIM 2.1).')
for (const warning of warnings) console.warn('UYARI:', warning)
