/**
 * ADIM 1.6 — Deploy sonrası smoke preflight (repo doğrulama).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')

function runNpm(script) {
  const result = spawnSync('npm', ['run', script], {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    stdio: 'pipe',
  })
  return { ok: result.status === 0, output: [result.stdout, result.stderr].filter(Boolean).join('\n').trim() }
}

console.log('ADIM 1.6 — Post-deploy smoke preflight\n')

if (!fs.existsSync(path.join(root, 'docs/release/ADIM_1_6_SMOKE_CHECKLIST.md'))) {
  console.error('✗ ADIM_1_6_SMOKE_CHECKLIST.md eksik')
  process.exit(1)
}

let failed = false
for (const [label, script] of [
  ['Firebase config', 'validate:firebase'],
  ['Firestore rules', 'validate:firestore-rules'],
  ['Cloud Functions', 'validate:functions'],
  ['Production RUM / Sentry', 'validate:rum'],
]) {
  process.stdout.write(`→ ${label}... `)
  const result = runNpm(script)
  if (result.ok) {
    console.log('OK')
  } else {
    console.log('BAŞARISIZ')
    if (result.output) console.error(result.output)
    failed = true
  }
}

if (failed) {
  console.error('\nRepo preflight başarısız. Canlı smoke: docs/release/ADIM_1_6_SMOKE_CHECKLIST.md')
  process.exit(1)
}

console.log('\nRepo preflight geçti.')
console.log('Canlı smoke checklist: docs/release/ADIM_1_6_SMOKE_CHECKLIST.md')
console.log('Open beta öncesi: npm run release:regression')
console.log('Manuel: tarayıcıda domain + Google giriş + keşfet')
