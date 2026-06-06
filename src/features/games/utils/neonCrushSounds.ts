type NeonSoundId =
  | 'select'
  | 'swap'
  | 'match'
  | 'combo'
  | 'line4'
  | 'mega'
  | 'special'
  | 'prism'
  | 'pressure'
  | 'rush'
  | 'fall'
  | 'invalid'
  | 'round'
  | 'win'
  | 'lose'

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

export function unlockNeonCrushAudio() {
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
  delay = 0,
) {
  const ctx = getCtx()
  if (!ctx || !unlocked) return
  const start = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), start + duration)
  amp.gain.setValueAtTime(gain, start)
  amp.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.03)
}

const lastPlayed: Partial<Record<NeonSoundId, number>> = {}
const MIN_GAP: Record<NeonSoundId, number> = {
  select: 50,
  swap: 80,
  match: 120,
  combo: 200,
  line4: 180,
  mega: 280,
  special: 220,
  prism: 320,
  pressure: 240,
  rush: 400,
  fall: 90,
  invalid: 160,
  round: 500,
  win: 900,
  lose: 900,
}

export function playNeonCrushSound(id: NeonSoundId) {
  const now = performance.now()
  if (lastPlayed[id] && now - lastPlayed[id]! < MIN_GAP[id]) return
  lastPlayed[id] = now

  switch (id) {
    case 'select':
      tone(720, 0.04, 'sine', 0.035, 980)
      break
    case 'swap':
      tone(380, 0.06, 'triangle', 0.04, 520)
      break
    case 'match':
      tone(520, 0.07, 'triangle', 0.05, 780)
      tone(880, 0.09, 'sine', 0.035, 1100, 0.05)
      break
    case 'combo':
      tone(660, 0.08, 'square', 0.04, 920)
      tone(920, 0.1, 'triangle', 0.045, 1240, 0.07)
      tone(1240, 0.12, 'sine', 0.03, 1480, 0.14)
      break
    case 'line4':
      tone(580, 0.09, 'triangle', 0.05, 880)
      tone(1040, 0.11, 'sine', 0.04, 1320, 0.06)
      break
    case 'mega':
      tone(440, 0.1, 'sawtooth', 0.035, 660)
      tone(880, 0.12, 'square', 0.045, 1320, 0.08)
      tone(1320, 0.14, 'sine', 0.05, 1760, 0.16)
      tone(1760, 0.1, 'triangle', 0.03, 2200, 0.24)
      break
    case 'special':
      tone(620, 0.08, 'triangle', 0.045, 940)
      tone(1040, 0.1, 'sine', 0.04, 1480, 0.06)
      break
    case 'prism':
      tone(520, 0.09, 'sawtooth', 0.04, 780)
      tone(980, 0.11, 'square', 0.045, 1480, 0.07)
      tone(1480, 0.13, 'sine', 0.05, 1980, 0.14)
      break
    case 'pressure':
      tone(180, 0.12, 'sawtooth', 0.05, 90)
      tone(320, 0.1, 'square', 0.04, 520, 0.05)
      break
    case 'rush':
      tone(740, 0.08, 'triangle', 0.04, 1100)
      tone(1100, 0.1, 'sine', 0.045, 1540, 0.06)
      break
    case 'fall':
      tone(240, 0.05, 'sine', 0.025, 360)
      break
    case 'invalid':
      tone(200, 0.1, 'sawtooth', 0.04, 120)
      break
    case 'round':
      tone(440, 0.12, 'triangle', 0.05, 660)
      break
    case 'win':
      tone(523, 0.1, 'triangle', 0.05, 784, 0)
      tone(659, 0.12, 'triangle', 0.05, 988, 0.12)
      tone(784, 0.14, 'sine', 0.04, 1175, 0.22)
      break
    case 'lose':
      tone(180, 0.16, 'sawtooth', 0.045, 100)
      break
    default:
      break
  }
}
