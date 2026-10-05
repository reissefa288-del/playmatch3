/**
 * ADIM 2.3 — Bubblewrap init veya update.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { withLocalManifestServer } from './twa-local-manifest-server.mjs'

const root = path.resolve(import.meta.dirname, '..')
const androidDir = path.join(root, 'android')

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'))
}

function isInitialized() {
  return fs.existsSync(path.join(androidDir, 'app', 'build.gradle'))
}

function runBubblewrap(args, { autoYes = false } = {}) {
  console.log(`\n> npx @bubblewrap/cli ${args.join(' ')}\n`)
  const options = {
    cwd: androidDir,
    encoding: 'utf8',
    shell: true,
  }
  if (autoYes) {
    options.input = '\n'.repeat(48)
    options.stdio = ['pipe', 'inherit', 'inherit']
  } else {
    options.stdio = 'inherit'
  }
  const result = spawnSync('npx', ['@bubblewrap/cli', ...args], options)
  return result.status === 0
}

const autoYes = process.argv.includes('--yes')

const preflight = spawnSync('node', ['scripts/twa-preflight-build.mjs', '--init-only'], {
  cwd: root,
  stdio: 'inherit',
})
if (preflight.status !== 0) process.exit(1)

const host = readJson('android/twa-host.json').host
const manifestUrl = `https://${host}/manifest.webmanifest`
const useLocal = process.argv.includes('--local-manifest')

if (isInitialized()) {
  console.log('Bubblewrap projesi zaten var — update çalıştırılıyor...')
  if (!runBubblewrap(['update'])) process.exit(1)
  console.log('\nInit/update tamam → npm run twa:build')
  process.exit(0)
}

console.log('ADIM 2.3 — Bubblewrap init\n')
const twa = readJson('android/twa-manifest.json')
console.log('twa-manifest.json değerleri (sorulursa aynısını gir):\n')
console.log(`  Domain / Host     → ${twa.host}`)
console.log(`  Package ID        → ${twa.packageId}`)
console.log(`  App name          → ${twa.name}`)
console.log(`  Launcher name     → ${twa.launcherName}`)
console.log(`  Theme color       → ${twa.themeColor}`)
console.log(`  Background color  → ${twa.backgroundColor}`)
console.log(`  Start URL         → ${twa.startUrl}`)
console.log(`  Display mode      → ${twa.display}`)
console.log(`  Orientation       → ${twa.orientation}`)
console.log('')

const backup = path.join(androidDir, 'twa-manifest.json')
const backupCopy = `${backup}.bak`
if (fs.existsSync(backup)) {
  fs.copyFileSync(backup, backupCopy)
  console.log('Yedek:', path.relative(root, backupCopy))
}

async function runInit(manifestArg) {
  console.log(`Manifest URL: ${manifestArg}\n`)
  if (!runBubblewrap(['init', `--manifest=${manifestArg}`], { autoYes: autoYes || useLocal })) {
    if (fs.existsSync(backupCopy)) fs.copyFileSync(backupCopy, backup)
    process.exit(1)
  }

  if (fs.existsSync(backupCopy)) {
    const saved = readJson('android/twa-manifest.json.bak')
    const current = readJson('android/twa-manifest.json')
    current.packageId = saved.packageId
    current.host = saved.host
    current.fingerprints = saved.fingerprints ?? current.fingerprints
    current.iconUrl = saved.iconUrl
    current.maskableIconUrl = saved.maskableIconUrl
    current.webManifestUrl = saved.webManifestUrl
    fs.writeFileSync(backup, `${JSON.stringify(current, null, 2)}\n`, 'utf8')
    fs.unlinkSync(backupCopy)
    runBubblewrap(['update'])
  }

  console.log('\nInit tamam → npm run twa:build')
}

if (useLocal) {
  console.log('Yerel manifest sunucusu başlatılıyor (public/)…\n')
  await withLocalManifestServer(runInit)
} else {
  console.log('Canlı site yoksa: npm run twa:init -- --local-manifest\n')
  await runInit(manifestUrl)
}
