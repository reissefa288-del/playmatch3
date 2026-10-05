/**
 * Faz E — duel arka plan videosunu WebM + MP4 olarak sıkıştır (≤2 MB hedef).
 * Kullanım: node scripts/optimize-video.mjs
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const refDir = path.join(root, 'src/reference')
const videoOutDir = path.join(refDir, 'opt/video')
const sourceVideo = path.join(refDir, 'video.mp4')
const TARGET_BYTES = 2 * 1024 * 1024

const WEBM_OUT = path.join(videoOutDir, 'duel-bg.webm')
const MP4_OUT = path.join(videoOutDir, 'duel-bg.mp4')

function runFfmpeg(args) {
  if (!ffmpegPath) throw new Error('ffmpeg-static binary not found')
  execFileSync(ffmpegPath, args, { stdio: 'pipe' })
}

function fileSize(filePath) {
  return fs.statSync(filePath).size
}

function transcodeWebm(crf) {
  runFfmpeg([
    '-y',
    '-i',
    sourceVideo,
    '-an',
    '-c:v',
    'libvpx-vp9',
    '-crf',
    String(crf),
    '-b:v',
    '0',
    '-row-mt',
    '1',
    '-vf',
    'scale=min(960\\,iw):-2',
    '-deadline',
    'good',
    '-cpu-used',
    '2',
    WEBM_OUT,
  ])
}

function transcodeMp4(crf) {
  runFfmpeg([
    '-y',
    '-i',
    sourceVideo,
    '-an',
    '-c:v',
    'libx264',
    '-crf',
    String(crf),
    '-preset',
    'slow',
    '-movflags',
    '+faststart',
    '-vf',
    'scale=min(960\\,iw):-2',
    '-pix_fmt',
    'yuv420p',
    MP4_OUT,
  ])
}

function pickWithinBudget(transcode, label, startCrf) {
  let crf = startCrf
  while (crf <= 48) {
    transcode(crf)
    const bytes = fileSize(label === 'webm' ? WEBM_OUT : MP4_OUT)
    console.log(`${label} crf=${crf}: ${(bytes / 1024 / 1024).toFixed(2)} MB`)
    if (bytes <= TARGET_BYTES) return bytes
    crf += 4
  }
  return fileSize(label === 'webm' ? WEBM_OUT : MP4_OUT)
}

if (!fs.existsSync(sourceVideo)) {
  console.error('Missing src/reference/video.mp4')
  process.exit(1)
}

fs.mkdirSync(videoOutDir, { recursive: true })

console.log(`Source: ${(fileSize(sourceVideo) / 1024 / 1024).toFixed(2)} MB`)
console.log('Transcoding WebM (VP9)...')
const webmBytes = pickWithinBudget(transcodeWebm, 'webm', 34)
console.log('Transcoding MP4 (H.264)...')
const mp4Bytes = pickWithinBudget(transcodeMp4, 'mp4', 30)

const worst = Math.max(webmBytes, mp4Bytes)
if (worst > TARGET_BYTES) {
  console.warn(`Warning: smallest encode still ${(worst / 1024 / 1024).toFixed(2)} MB (target ≤2 MB)`)
} else {
  console.log(`Done — webm ${(webmBytes / 1024).toFixed(0)} KB, mp4 ${(mp4Bytes / 1024).toFixed(0)} KB`)
}
