type BlockSoundId =
  | 'move'
  | 'rotate'
  | 'drop'
  | 'lock'
  | 'fusion'
  | 'surge'
  | 'attack'
  | 'round'
  | 'win'
  | 'lose'
  | 'gameover'
  | 'combo'
  | 'nova'

let audioCtx: AudioContext | null = null
let unlocked = false

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

export function unlockBlockAudio() {
  const ctx = getCtx()
  if (!ctx || unlocked) return
  unlocked = true
  if (ctx.state === 'suspended') void ctx.resume()
}

function tone(freq: number, duration: number, type: OscillatorType, gain: number, slideTo?: number, delay = 0) {
  const ctx = getCtx()
  if (!ctx || !unlocked) return
  const start = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration)
  amp.gain.setValueAtTime(gain, start)
  amp.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

const lastPlayed: Partial<Record<BlockSoundId, number>> = {}
const MIN_GAP: Record<BlockSoundId, number> = {
  move: 55,
  rotate: 90,
  drop: 40,
  lock: 120,
  fusion: 280,
  surge: 300,
  attack: 320,
  round: 400,
  win: 900,
  lose: 900,
  gameover: 900,
  combo: 350,
  nova: 500,
}

export function playBlockSound(id: BlockSoundId) {
  const now = performance.now()
  if (lastPlayed[id] && now - lastPlayed[id]! < MIN_GAP[id]) return
  lastPlayed[id] = now

  switch (id) {
    case 'move':
      tone(280, 0.04, 'square', 0.035, 220)
      break
    case 'rotate':
      tone(420, 0.06, 'triangle', 0.04, 560)
      break
    case 'drop':
      tone(180, 0.05, 'sine', 0.03, 120)
      break
    case 'lock':
      tone(220, 0.08, 'triangle', 0.045, 160)
      break
    case 'fusion':
      tone(523, 0.07, 'sine', 0.05)
      tone(784, 0.09, 'sine', 0.042, undefined, 0.06)
      break
    case 'surge':
      tone(320, 0.1, 'sawtooth', 0.05, 180)
      tone(240, 0.12, 'sawtooth', 0.04, 120, 0.08)
      break
    case 'combo':
      tone(660, 0.07, 'triangle', 0.05)
      tone(880, 0.1, 'triangle', 0.045, undefined, 0.07)
      break
    case 'nova':
      tone(440, 0.08, 'sawtooth', 0.05)
      tone(660, 0.1, 'sawtooth', 0.045, undefined, 0.08)
      tone(880, 0.14, 'sawtooth', 0.04, undefined, 0.16)
      tone(1100, 0.16, 'sine', 0.035, undefined, 0.24)
      break
    case 'attack':
      tone(180, 0.1, 'sawtooth', 0.05, 90)
      tone(120, 0.14, 'sawtooth', 0.04, 60, 0.06)
      break
    case 'round':
      tone(440, 0.08, 'triangle', 0.05)
      tone(660, 0.12, 'triangle', 0.045, undefined, 0.1)
      break
    case 'win':
      tone(523, 0.1, 'sine', 0.06)
      tone(784, 0.14, 'sine', 0.05, undefined, 0.12)
      break
    case 'lose':
      tone(280, 0.16, 'sawtooth', 0.045, 140)
      break
    case 'gameover':
      tone(220, 0.2, 'sawtooth', 0.05, 90)
      break
    default:
      break
  }
}
