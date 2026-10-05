/**
 * Faz I3 — brotli vs gzip transfer savings on production assets.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { brotliCompressSync, gzipSync } from 'node:zlib'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const distAssets = path.join(root, 'dist', 'assets')
const budgetsFile = path.join(root, 'performance', 'budgets.json')

function loadMinSavingsPercent() {
  try {
    const raw = readFileSync(budgetsFile, 'utf8')
    return JSON.parse(raw).production?.minBrotliSavingsPercent ?? 12
  } catch {
    return 12
  }
}

if (!existsSync(distAssets)) {
  console.error('dist/assets missing — run `npm run build` first.')
  process.exit(1)
}

const minSavings = loadMinSavingsPercent()
const targets = readdirSync(distAssets).filter((name) => /\.(js|css|html|svg|json)$/i.test(name))

if (!targets.length) {
  console.error('No compressible assets found in dist/assets')
  process.exit(1)
}

let totalRaw = 0
let totalGzip = 0
let totalBrotli = 0

for (const name of targets) {
  const filePath = path.join(distAssets, name)
  const raw = readFileSync(filePath)
  const gzip = gzipSync(raw).length
  const brotli = brotliCompressSync(raw).length
  totalRaw += raw.length
  totalGzip += gzip
  totalBrotli += brotli
}

const overallSavings = totalGzip > 0 ? ((totalGzip - totalBrotli) / totalGzip) * 100 : 0
const failures = []

console.log('PlayMeet compression check\n')
console.log(`  Assets scanned: ${targets.length}`)
console.log(`  Raw: ${(totalRaw / 1024).toFixed(1)} KB`)
console.log(`  Gzip: ${(totalGzip / 1024).toFixed(1)} KB`)
console.log(`  Brotli: ${(totalBrotli / 1024).toFixed(1)} KB`)
console.log(`  Brotli savings vs gzip: ${overallSavings.toFixed(1)}%`)

if (overallSavings < minSavings) {
  failures.push(
    `Overall brotli savings ${overallSavings.toFixed(1)}% < ${minSavings}% — enable brotli on CDN/nginx`,
  )
}

if (failures.length) {
  console.error('\nCompression check failures:')
  failures.forEach((line) => console.error(`  ✗ ${line}`))
  process.exit(1)
}

console.log(`\nCompression check passed (≥${minSavings}% brotli savings vs gzip).`)
