import type { BubbleKind } from './bubbleShooterEngine'

export type BubbleSoundId =
  | 'shoot'
  | 'shoot_fire'
  | 'shoot_bomb'
  | 'shoot_rainbow'
  | 'shoot_ice'
  | 'pop'
  | 'swap'
  | 'overflow'
  | 'round'
  | 'point'
  | 'win'
  | 'lose'

let audioCtx: AudioContext | null = null
let unlocked = false
const lastPlayed: Partial<Record<BubbleSoundId, number>> = {}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

export function unlockBubbleAudio() {
  const ctx = getCtx()
  if (!ctx) return
  unlocked = true
  if (ctx.state === 'suspended') void ctx.resume()
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  slideTo?: number,
  delay = 0,
) {
  const ctx = getCtx()
  if (!ctx || !unlocked) return
  if (ctx.state === 'suspended') {
    void ctx.resume().then(() => tone(freq, duration, type, gain, slideTo, delay))
    return
  }
  const t0 = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(24, slideTo), t0 + duration)
  amp.gain.setValueAtTime(gain, t0)
  amp.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

const GAP: Partial<Record<BubbleSoundId, number>> = {
  shoot: 50,
  shoot_fire: 110,
  shoot_bomb: 110,
  shoot_rainbow: 120,
  shoot_ice: 110,
  pop: 36,
  swap: 75,
  round: 400,
  overflow: 280,
}

function playId(id: BubbleSoundId) {
  const now = performance.now()
  const gap = GAP[id] ?? 40
  if (lastPlayed[id] && now - lastPlayed[id]! < gap) return
  lastPlayed[id] = now

  switch (id) {
    case 'shoot_fire':
      tone(200, 0.1, 'triangle', 0.05, 120)
      break
    case 'shoot_bomb':
      tone(110, 0.12, 'square', 0.045, 55)
      break
    case 'shoot_rainbow':
      tone(440, 0.07, 'sine', 0.04)
      tone(660, 0.09, 'sine', 0.035, undefined, 0.06)
      break
    case 'shoot_ice':
      tone(880, 0.06, 'sine', 0.035, 1200)
      break
    case 'round':
      tone(392, 0.1, 'sine', 0.05)
      tone(523, 0.12, 'sine', 0.04, undefined, 0.1)
      break
    case 'overflow':
      tone(180, 0.14, 'sawtooth', 0.06, 80)
      break
    case 'swap':
      tone(480, 0.06, 'sine', 0.04, 620)
      break
    case 'shoot':
    case 'pop':
    default:
      tone(520 + Math.random() * 50, 0.07, 'sine', 0.085, 280)
      break
  }
}

export function shootSoundForKind(kind: BubbleKind): BubbleSoundId {
  if (kind === 'fire') return 'shoot_fire'
  if (kind === 'bomb') return 'shoot_bomb'
  if (kind === 'rainbow') return 'shoot_rainbow'
  if (kind === 'ice') return 'shoot_ice'
  return 'shoot'
}

export function playBubbleSound(id: BubbleSoundId = 'pop') {
  playId(id)
}

export function playBubbleSoundOnGesture(id: BubbleSoundId = 'shoot') {
  unlockBubbleAudio()
  playId(id)
}
