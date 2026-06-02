type NeonSoundId = 'select' | 'swap' | 'match' | 'combo' | 'fall' | 'invalid' | 'round' | 'win' | 'lose'

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
