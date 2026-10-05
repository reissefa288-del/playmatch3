/**
 * P9 — verify `npm run build:production` wrote .br siblings where brotli saves bytes.
 */
import { brotliCompressSync } from 'node:zlib'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
const distAssets = path.join(distDir, 'assets')

const COMPRESSIBLE = /\.(js|css|html|svg|json)$/i

if (!existsSync(distAssets)) {
  console.error('dist/assets missing — run `npm run build:production` first.')
  process.exit(1)
}

const missing = []
let checked = 0
let skipped = 0

for (const name of readdirSync(distAssets)) {
  if (!COMPRESSIBLE.test(name) || name.endsWith('.br')) continue
  const rawPath = path.join(distAssets, name)
  const raw = readFileSync(rawPath)
  const brotli = brotliCompressSync(raw)
  if (brotli.length >= raw.length) {
    skipped += 1
    continue
  }

  checked += 1
  const brotliPath = `${rawPath}.br`
  if (!existsSync(brotliPath)) {
    missing.push(name)
    continue
  }
  const onDisk = readFileSync(brotliPath)
  if (onDisk.length >= raw.length) {
    missing.push(`${name} (.br not smaller than raw)`)
  }
}

if (!checked && !skipped) {
  console.error('No compressible assets found in dist/assets')
  process.exit(1)
}

if (missing.length) {
  console.error('Brotli artifact check failed:\n')
  missing.slice(0, 12).forEach((line) => console.error(`  • ${line}`))
  if (missing.length > 12) console.error(`  • …and ${missing.length - 12} more`)
  console.error('\nRun: npm run build:production')
  process.exit(1)
}

console.log(
  `Brotli artifact check passed (${checked} .br siblings; ${skipped} tiny assets skipped).`,
)
