/**
 * P0 — Android TWA paketi (2.2 keystore → 2.3 init → AAB build).
 *
 * npm run deploy:p0-android
 * npm run deploy:p0-android -- --skip-init    # Bubblewrap zaten init edildiyse
 * npm run deploy:p0-android -- --signing-only # sadece keystore + fingerprint
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const skipInit = process.argv.includes('--skip-init')
const signingOnly = process.argv.includes('--signing-only')

function run(label, cmd, args, { optional = false } = {}) {
  process.stdout.write(`\n→ ${label}... `)
  const result = spawnSync(cmd, args, {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    stdio: 'inherit',
  })
  if (result.status === 0) {
    console.log('OK')
    return true
  }
  if (optional) {
    console.log('ATLANDI')
    return true
  }
  console.log('BAŞARISIZ')
  return false
}

console.log('P0 — Android uygulama paketi\n')
console.log('Rehber: docs/release/ADIM_P0_ANDROID.md\n')

if (!run('TWA host sync', 'npm', ['run', 'twa:sync-host'])) process.exit(1)
if (!run('Signing setup (2.2)', 'node', ['scripts/setup-twa-signing.mjs'])) process.exit(1)
if (!run('TWA validate', 'npm', ['run', 'validate:twa'])) process.exit(1)

if (signingOnly) {
  console.log('\n── Signing tamam (2.2) ──')
  console.log('Sonraki: npm run deploy:hosting → npm run deploy:p0-android -- --skip-init')
  process.exit(0)
}

const hasProject = fs.existsSync(path.join(root, 'android', 'app', 'build.gradle'))
if (!hasProject && !skipInit) {
  console.log('\n── Bubblewrap init (2.3) ──')
  console.log('Terminal sorularında twa-manifest.json değerlerini onayla.\n')
  if (!run('Bubblewrap init', 'npm', ['run', 'twa:init', '--', '--local-manifest', '--yes'])) {
    console.error('\nInit başarısız — JDK/SDK: npx @bubblewrap/cli doctor')
    process.exit(1)
  }
} else if (!hasProject) {
  console.error('\nBubblewrap projesi yok — npm run twa:init -- --local-manifest')
  process.exit(1)
} else {
  console.log('\n→ Bubblewrap init... ATLANDI (proje mevcut)')
}

if (!run('Release AAB build (2.3)', 'npm', ['run', 'twa:build'])) process.exit(1)

console.log('\n── P0 Android paketi tamam ──\n')
console.log('Sonraki (sen — Play Console):')
console.log('  1. npm run deploy:hosting  (assetlinks canlıda olmalı)')
console.log('  2. Play Console → Internal/Closed test → AAB yükle')
console.log('  3. ADIM_2_4_PLAY_CONSOLE.md — listing, Data Safety, rating')
console.log('  4. ADIM_2_6_CLOSED_TEST.md — tester listesi')
console.log('\nDurum: npm run p0:android:status')
