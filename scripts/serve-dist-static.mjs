/**
 * P9 — brotli-aware static file resolver for preview / Lighthouse servers.
 * Mirrors nginx `brotli_static`: serve pre-compressed `.br` siblings when accepted.
 */
import { createReadStream, existsSync, statSync } from 'node:fs'
import path from 'node:path'

export function mimeFor(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (filePath.endsWith('.webp')) return 'image/webp'
  if (filePath.endsWith('.avif')) return 'image/avif'
  if (filePath.endsWith('.woff2')) return 'font/woff2'
  if (filePath.endsWith('.json')) return 'application/json'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'
  if (filePath.endsWith('.mp4')) return 'video/mp4'
  if (filePath.endsWith('.webm')) return 'video/webm'
  return 'application/octet-stream'
}

export function cacheControlFor(urlPath) {
  if (urlPath.includes('/assets/') || /\.(js|css|woff2|webp|avif|svg|png|jpg|mp4|webm|br)$/i.test(urlPath)) {
    return 'public, max-age=31536000, immutable'
  }
  if (urlPath === '/' || urlPath.endsWith('.html')) {
    return 'public, max-age=0, must-revalidate'
  }
  return 'public, max-age=0, must-revalidate'
}

/** Resolve disk path + optional brotli encoding for a request URL. */
export function resolveDistAsset(distDir, urlPath, acceptEncoding = '') {
  const decoded = decodeURIComponent(urlPath.split('?')[0] ?? '/')
  let filePath = path.join(distDir, decoded === '/' ? 'index.html' : decoded)

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html')
  }

  const acceptsBrotli = /\bbr\b/i.test(acceptEncoding)
  const brotliPath = `${filePath}.br`
  if (acceptsBrotli && !filePath.endsWith('.br') && existsSync(brotliPath)) {
    return { filePath: brotliPath, contentType: mimeFor(filePath), encoding: 'br' }
  }

  return { filePath, contentType: mimeFor(filePath), encoding: null }
}

/** Node http handler — pipe resolved asset (with brotli when available). */
export function handleDistRequest(req, res, distDir, next) {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/')
  res.setHeader('Cache-Control', cacheControlFor(urlPath))

  const acceptEncoding = req.headers['accept-encoding'] ?? ''
  const { filePath, contentType, encoding } = resolveDistAsset(distDir, urlPath, acceptEncoding)

  if (!existsSync(filePath)) {
    if (typeof next === 'function') return next()
    res.writeHead(404)
    res.end()
    return
  }

  const headers = { 'Content-Type': contentType }
  if (encoding) headers['Content-Encoding'] = encoding
  res.writeHead(200, headers)
  createReadStream(filePath).pipe(res)
}
