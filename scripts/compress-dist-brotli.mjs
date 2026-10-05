/**
 * Faz I3 — pre-compress dist assets for nginx brotli_static / CDN upload.
 */
import { brotliCompressSync } from 'node:zlib'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.(js|css|html|svg|json|txt|xml)$/i.test(entry.name) && !entry.name.endsWith('.br')) {
      out.push(full)
    }
  }
  return out
}

if (!existsSync(distDir)) {
  console.error('dist/ missing — run `npm run build` first.')
  process.exit(1)
}

let written = 0
let savedBytes = 0

for (const filePath of walk(distDir)) {
  const raw = readFileSync(filePath)
  const brotli = brotliCompressSync(raw)
  if (brotli.length >= raw.length) continue
  writeFileSync(`${filePath}.br`, brotli)
  written += 1
  savedBytes += raw.length - brotli.length
}

console.log(`Brotli pre-compress: ${written} files, ${(savedBytes / 1024).toFixed(1)} KB saved vs raw.`)
