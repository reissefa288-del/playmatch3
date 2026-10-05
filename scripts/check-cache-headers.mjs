/**
 * Faz I2 — static asset cache policy (CDN / edge).
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const headersFile = path.join(root, 'public', '_headers')
const viteConfig = path.join(root, 'vite.config.ts')

const errors = []

if (!existsSync(headersFile)) {
  errors.push('Missing public/_headers for CDN cache rules')
} else {
  const headers = readFileSync(headersFile, 'utf8')
  if (!/\/assets\/\*[\s\S]*immutable/i.test(headers)) {
    errors.push('public/_headers must set immutable Cache-Control for /assets/*')
  }
  if (!/must-revalidate/i.test(headers)) {
    errors.push('public/_headers must set must-revalidate for HTML shell (/*)')
  }
}

const viteSrc = readFileSync(viteConfig, 'utf8')
if (!/immutable/i.test(viteSrc) || !/cacheControlFor/.test(viteSrc)) {
  errors.push('vite.config.ts preview middleware must set immutable Cache-Control for hashed assets')
}
if (!/brotliStaticPreview|brotli-static-preview/.test(viteSrc)) {
  errors.push('vite.config.ts preview must serve pre-compressed .br siblings (brotliStaticPreview)')
}
if (!/must-revalidate/i.test(viteSrc) && !/cacheControlFor/.test(viteSrc)) {
  errors.push('vite.config.ts preview middleware must set must-revalidate for index.html')
}

if (errors.length) {
  console.error('Cache header check failed:\n')
  errors.forEach((line) => console.error(`  • ${line}`))
  process.exit(1)
}

console.log('Cache header check passed (_headers + preview middleware).')
