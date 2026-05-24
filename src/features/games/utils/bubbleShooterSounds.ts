type BubbleSoundId = 'shoot' | 'pop' | 'swap' | 'overflow' | 'point' | 'round' | 'win' | 'lose'

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

export function unlockBubbleAudio() {
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

const lastPlayed: Partial<Record<BubbleSoundId, number>> = {}
const MIN_GAP: Record<BubbleSoundId, number> = {
  shoot: 120,
  pop: 45,
  swap: 180,
  overflow: 500,
  point: 350,
  round: 400,
  win: 900,
  lose: 900,
}

export function playBubbleSound(id: BubbleSoundId) {
  const now = performance.now()
  if (lastPlayed[id] && now - lastPlayed[id]! < MIN_GAP[id]) return
  lastPlayed[id] = now

  switch (id) {
    case 'shoot':
      tone(380, 0.07, 'triangle', 0.055, 620)
      break
    case 'pop':
      tone(520 + Math.random() * 60, 0.06, 'sine', 0.05, 280)
      break
    case 'swap':
      tone(440, 0.06, 'sine', 0.04, 660)
      break
    case 'overflow':
      tone(220, 0.2, 'sawtooth', 0.055, 110)
      break
    case 'round':
      tone(523, 0.08, 'triangle', 0.055)
      tone(784, 0.12, 'triangle', 0.05, undefined, 0.1)
      break
    case 'point':
      tone(660, 0.1, 'triangle', 0.05, 990)
      break
    case 'win':
      tone(523, 0.1, 'sine', 0.06)
      tone(784, 0.14, 'sine', 0.05, undefined, 0.12)
      break
    case 'lose':
      tone(330, 0.16, 'sawtooth', 0.045, 180)
      break
    default:
      break
  }
}
