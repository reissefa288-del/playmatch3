/**
 * twa:init --local-manifest için geçici HTTP sunucusu (public/).
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const publicDir = path.join(root, 'public')

function contentType(filePath) {
  if (filePath.endsWith('.webmanifest') || filePath.endsWith('.json')) return 'application/manifest+json'
  if (filePath.endsWith('.png')) return 'image/png'
  if (filePath.endsWith('.webp')) return 'image/webp'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'
  return 'application/octet-stream'
}

function startLocalManifestServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url?.split('?')[0] ?? '/')
    const safePath = urlPath.replace(/\.\./g, '')
    const filePath = path.join(publicDir, safePath === '/' ? 'index.html' : safePath)
    if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.statusCode = 404
      res.end('Not found')
      return
    }
    res.setHeader('Content-Type', contentType(filePath))
    fs.createReadStream(filePath).pipe(res)
  })

  return new Promise((resolve, reject) => {
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const boundPort = typeof address === 'object' && address ? address.port : 8765
      resolve({
        url: `http://127.0.0.1:${boundPort}/manifest.webmanifest`,
        close: () =>
          new Promise((done) => {
            server.close(() => done())
          }),
      })
    })
  })
}

export async function withLocalManifestServer(run) {
  const server = await startLocalManifestServer()
  try {
    return await run(server.url)
  } finally {
    await server.close()
  }
}
