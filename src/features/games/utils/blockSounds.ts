type BlockSoundId =
  | 'move'
  | 'rotate'
  | 'drop'
  | 'lock'
  | 'line'
  | 'attack'
  | 'round'
  | 'win'
  | 'lose'
  | 'gameover'
  | 'hold'
  | 'combo'
  | 'tetris'

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
  line: 280,
  attack: 320,
  round: 400,
  win: 900,
  lose: 900,
  gameover: 900,
  hold: 180,
  combo: 350,
  tetris: 500,
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
    case 'line':
      tone(523, 0.08, 'sine', 0.05)
      tone(784, 0.1, 'sine', 0.045, undefined, 0.08)
      tone(988, 0.12, 'sine', 0.04, undefined, 0.16)
      break
    case 'combo':
      tone(660, 0.07, 'triangle', 0.05)
      tone(880, 0.1, 'triangle', 0.045, undefined, 0.07)
      break
    case 'tetris':
      tone(440, 0.08, 'sawtooth', 0.05)
      tone(660, 0.1, 'sawtooth', 0.045, undefined, 0.08)
      tone(880, 0.14, 'sawtooth', 0.04, undefined, 0.16)
      tone(1100, 0.16, 'sine', 0.035, undefined, 0.24)
      break
    case 'hold':
      tone(360, 0.06, 'sine', 0.04, 520)
      tone(480, 0.08, 'sine', 0.035, undefined, 0.05)
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
