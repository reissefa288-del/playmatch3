import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const source = path.join(root, 'src/reference/logoo.png')
const outDir = path.join(root, 'public/icons')
const bg = '#060818'

if (!fs.existsSync(source)) {
  console.error('Missing source logo:', source)
  process.exit(1)
}

fs.mkdirSync(outDir, { recursive: true })

async function writeIcon(size, filename, paddingRatio = 0.12) {
  const padding = Math.round(size * paddingRatio)
  const inner = size - padding * 2
  const buffer = await sharp(source)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: buffer, gravity: 'centre' }])
    .png()
    .toFile(path.join(outDir, filename))

  console.log('wrote', filename)
}

async function writeMaskable(size, filename) {
  const padding = Math.round(size * 0.2)
  const inner = size - padding * 2
  const buffer = await sharp(source)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: buffer, gravity: 'centre' }])
    .png()
    .toFile(path.join(outDir, filename))

  console.log('wrote', filename)
}

await writeIcon(192, 'icon-192.png')
await writeIcon(512, 'icon-512.png')
await writeMaskable(512, 'icon-maskable-512.png')

const favicon = await sharp(source).resize(64, 64, { fit: 'contain' }).png().toBuffer()
await sharp({
  create: { width: 64, height: 64, channels: 4, background: bg },
})
  .composite([{ input: favicon, gravity: 'centre' }])
  .png()
  .toFile(path.join(root, 'public/favicon.png'))

console.log('PWA icons generated.')
