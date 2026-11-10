/**
 * ADIM 2.3 — Bubblewrap init veya update.
 */
import { createRequire } from 'node:module'
import { spawn, spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { withLocalManifestServer } from './twa-local-manifest-server.mjs'

const require = createRequire(import.meta.url)

const root = path.resolve(import.meta.dirname, '..')
const androidDir = path.join(root, 'android')

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'))
}

function isInitialized() {
  return fs.existsSync(path.join(androidDir, 'app', 'build.gradle'))
}

function runBubblewrap(args) {
  console.log(`\n> npx @bubblewrap/cli ${args.join(' ')}\n`)
  return new Promise((resolve) => {
    const child = spawn('npx', ['@bubblewrap/cli', ...args], {
      cwd: androidDir,
      shell: true,
      stdio: 'inherit',
    })
    child.on('exit', (code) => resolve(code === 0))
    child.on('error', () => resolve(false))
  })
}

function loadBubblewrapCore() {
  const candidate = path.join(
    process.env.APPDATA ?? '',
    'npm/node_modules/@bubblewrap/cli/node_modules/@bubblewrap/core',
  )
  return require(candidate)
}

async function generateAndroidProject() {
  const core = loadBubblewrapCore()
  const manifestPath = path.join(androidDir, 'twa-manifest.json')
  const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const iconOrigin = 'https://playmeet-prod-1bbda.web.app'
  data.host = 'playmeet-prod-1bbda.web.app'
  data.webManifestUrl = `${iconOrigin}/manifest.webmanifest`
  data.appVersion = data.appVersion || data.appVersionName || '1.0.0'
  data.signingKey = {
    path: path.join(androidDir, 'playmeet-upload.keystore'),
    alias: 'playmeet',
  }
  data.iconUrl = `${iconOrigin}/icons/icon-512.png`
  data.maskableIconUrl = `${iconOrigin}/icons/icon-maskable-512.png`
  const manifest = new core.TwaManifest(data)
  const error = manifest.validate()
  if (error) throw new Error(error)
  console.log('Android projesi üretiliyor (Bubblewrap core)...')
  await new core.TwaGenerator().createTwaProject(androidDir, manifest, new core.ConsoleLog('init'))
  const gradlePath = path.join(androidDir, 'app', 'build.gradle')
  const gradle = fs.readFileSync(gradlePath, 'utf8').replace(/targetSdkVersion\s+\d+/, 'targetSdkVersion 36')
  fs.writeFileSync(gradlePath, gradle)
  await manifest.saveToFile(manifestPath)
  const sum = crypto.createHash('sha1').update(fs.readFileSync(manifestPath)).digest('hex')
  fs.writeFileSync(path.join(androidDir, 'manifest-checksum.txt'), sum)
  console.log('\nInit tamam → npm run twa:build')
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
  if (autoYes) {
    try {
      await generateAndroidProject()
    } catch (error) {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    }
    process.exit(0)
  }
  console.log('Bubblewrap projesi zaten var — update çalıştırılıyor...')
  if (!(await runBubblewrap(['update']))) process.exit(1)
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
  if (!(await runBubblewrap(['init', `--manifest=${manifestArg}`]))) {
    if (fs.existsSync(backupCopy)) fs.copyFileSync(backupCopy, backup)
    process.exit(1)
  }

  if (fs.existsSync(backupCopy)) {
    const saved = readJson('android/twa-manifest.json.bak')
    const current = readJson('android/twa-manifest.json')
    current.packageId = saved.packageId
    current.host = saved.host
    current.fingerprints = saved.fingerprints ?? current.fingerprints
    current.webManifestUrl = saved.webManifestUrl
    fs.writeFileSync(backup, `${JSON.stringify(current, null, 2)}\n`, 'utf8')
    fs.unlinkSync(backupCopy)
    await runBubblewrap(['update'])
  }

  console.log('\nInit tamam → npm run twa:build')
}

if (autoYes) {
  try {
    await generateAndroidProject()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
  process.exit(0)
}

if (useLocal) {
  console.log('Yerel manifest sunucusu başlatılıyor (public/)…\n')
  await withLocalManifestServer(runInit)
} else {
  console.log('Canlı site yoksa: npm run twa:init -- --local-manifest\n')
  await runInit(manifestUrl)
}
