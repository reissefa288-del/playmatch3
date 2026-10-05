/**
 * Faz F5 — setInterval kullanan dosyaların görünürlük koruması var mı?
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, '..', 'src')

const GUARD_IMPORTS = [
  'useRuntimeActive',
  'useDocumentVisible',
  'useIntervalWhenActive',
  'useRafIntervalWhenActive',
  'useManagedTimeout',
  'useManagedTimers',
]

const ALLOWLIST = new Set([
  'src/shared/useIntervalWhenActive.ts',
  'src/features/games/components/SnakeDuelControls.tsx',
])

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      walk(full, out)
      continue
    }
    if (/\.(tsx?)$/.test(entry.name)) out.push(full)
  }
  return out
}

const failures = []

for (const file of walk(srcDir)) {
  const rel = path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/')
  if (ALLOWLIST.has(rel)) continue
  const text = fs.readFileSync(file, 'utf8')
  if (!text.includes('setInterval(')) continue
  const guarded = GUARD_IMPORTS.some((name) => text.includes(name))
  if (!guarded) {
    failures.push(`${rel} uses setInterval without visibility guard`)
  }
}

console.log('PlayMeet runtime timer audit\n')
if (failures.length) {
  failures.forEach((line) => console.error(`  ✗ ${line}`))
  process.exit(1)
}
console.log('  OK — all setInterval call sites use runtime visibility guards')
