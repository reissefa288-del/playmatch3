/**
 * ADIM 2.3 — Bubblewrap release AAB build.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const androidDir = path.join(root, 'android')

function findAab(dir, found = []) {
  if (!fs.existsSync(dir)) return found
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) findAab(full, found)
    else if (entry.name.endsWith('.aab')) found.push(full)
  }
  return found
}

const preflight = spawnSync('npm', ['run', 'twa:preflight-build'], {
  cwd: root,
  shell: true,
  stdio: 'inherit',
})
if (preflight.status !== 0) process.exit(1)

if (!fs.existsSync(path.join(androidDir, 'app', 'build.gradle'))) {
  console.error('Bubblewrap projesi yok — önce: npm run twa:init')
  process.exit(1)
}

const signingProps = path.join(androidDir, 'signingKey.properties')
if (!fs.existsSync(signingProps)) {
  console.error('android/signingKey.properties eksik — example dosyasını kopyala ve doldur')
  process.exit(1)
}

console.log('\n> npx @bubblewrap/cli build\n')
const build = spawnSync('npx', ['@bubblewrap/cli', 'build'], {
  cwd: androidDir,
  encoding: 'utf8',
  shell: true,
  stdio: 'inherit',
})

if (build.status !== 0) process.exit(build.status ?? 1)

const aabs = findAab(androidDir).sort((a, b) => {
  const stat = (p) => fs.statSync(p).mtimeMs
  return stat(b) - stat(a)
})

console.log('\nADIM 2.3 — build tamam.')
if (aabs.length) {
  console.log('\nAAB dosyaları:')
  for (const aab of aabs) {
    const sizeMb = (fs.statSync(aab).size / (1024 * 1024)).toFixed(2)
    console.log(`  ${path.relative(root, aab)} (${sizeMb} MB)`)
  }
  console.log('\nPlay Console → Testing → Internal/Closed →', path.relative(root, aabs[0]))
} else {
  console.warn('AAB bulunamadı — android/app/build/outputs/bundle/ kontrol et')
}
