type SoundId = 'paddle' | 'brick' | 'charge' | 'bonus' | 'armor' | 'life' | 'powerup' | 'win'

let audioCtx: AudioContext | null = null
let unlocked = false

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

export function unlockBrickBreakAudio() {
  const ctx = getCtx()
  if (!ctx || unlocked) return
  unlocked = true
  if (ctx.state === 'suspended') void ctx.resume()
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  slideTo?: number,
) {
  const ctx = getCtx()
  if (!ctx || !unlocked) return
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + duration)
  }
  amp.gain.setValueAtTime(gain, ctx.currentTime)
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration + 0.02)
}

const lastPlayed: Partial<Record<SoundId, number>> = {}
const MIN_GAP_MS: Record<SoundId, number> = {
  paddle: 55,
  brick: 40,
  charge: 120,
  bonus: 180,
  armor: 90,
  life: 400,
  powerup: 200,
  win: 800,
}

export function playBrickBreakSound(id: SoundId) {
  const now = performance.now()
  const gap = MIN_GAP_MS[id]
  if (lastPlayed[id] && now - lastPlayed[id]! < gap) return
  lastPlayed[id] = now

  switch (id) {
    case 'paddle':
      tone(320, 0.06, 'sine', 0.07, 480)
      break
    case 'brick':
      tone(520 + Math.random() * 80, 0.07, 'triangle', 0.06, 280)
      break
    case 'charge':
      tone(640, 0.1, 'sine', 0.05, 920)
      break
    case 'bonus':
      tone(880, 0.12, 'square', 0.045, 1320)
      tone(660, 0.14, 'sine', 0.035)
      break
    case 'armor':
      tone(180, 0.08, 'square', 0.05, 120)
      break
    case 'life':
      tone(220, 0.2, 'sawtooth', 0.06, 90)
      break
    case 'powerup':
      tone(440, 0.08, 'sine', 0.07, 880)
      tone(660, 0.1, 'triangle', 0.05, 990)
      break
    case 'win':
      tone(523, 0.12, 'sine', 0.06)
      tone(659, 0.12, 'sine', 0.05)
      tone(784, 0.18, 'sine', 0.05)
      break
    default:
      break
  }
}
