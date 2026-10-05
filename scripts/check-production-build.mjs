/**
 * Faz I4 — production build guards (no source maps in dist).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
const viteConfig = path.join(root, 'vite.config.ts')

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

const errors = []

if (!existsSync(distDir)) {
  console.error('dist/ missing — run `npm run build` first.')
  process.exit(1)
}

const mapFiles = walk(distDir).filter((file) => file.endsWith('.map'))
if (mapFiles.length) {
  errors.push(`Source maps must not ship in production (${mapFiles.length} .map files in dist/)`)
}

const viteSrc = readFileSync(viteConfig, 'utf8')
if (/sourcemap\s*:\s*true/.test(viteSrc)) {
  errors.push('vite.config.ts must not enable build.sourcemap: true for production')
}

if (errors.length) {
  console.error('Production build check failed:\n')
  errors.forEach((line) => console.error(`  • ${line}`))
  process.exit(1)
}

console.log('Production build check passed (no source maps in dist).')
