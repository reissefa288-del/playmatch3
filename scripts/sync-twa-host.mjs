/**
 * android/twa-host.json → android/twa-manifest.json URL alanlarını senkronize eder.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const hostFile = path.join(root, 'android', 'twa-host.json')
const twaFile = path.join(root, 'android', 'twa-manifest.json')

if (!fs.existsSync(hostFile)) {
  console.error('android/twa-host.json eksik — android/twa-host.example.json kopyala')
  process.exit(1)
}

const { host } = JSON.parse(fs.readFileSync(hostFile, 'utf8'))
if (!host || typeof host !== 'string' || host.includes(' ')) {
  console.error('android/twa-host.json geçersiz host')
  process.exit(1)
}

const twa = JSON.parse(fs.readFileSync(twaFile, 'utf8'))
const base = `https://${host}`

twa.host = host
twa.iconUrl = `${base}/icons/icon-512.png`
twa.maskableIconUrl = `${base}/icons/icon-maskable-512.png`
twa.webManifestUrl = `${base}/manifest.webmanifest`

fs.writeFileSync(twaFile, `${JSON.stringify(twa, null, 2)}\n`, 'utf8')
console.log(`TWA manifest host senkronize: ${host}`)
