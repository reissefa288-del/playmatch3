type MemorySoundId = 'flip' | 'match' | 'miss' | 'combo' | 'round' | 'win' | 'lose'

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

export function unlockMemoryDuelAudio() {
  const ctx = getCtx()
  if (!ctx) return
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

const lastPlayed: Partial<Record<MemorySoundId, number>> = {}
const MIN_GAP: Record<MemorySoundId, number> = {
  flip: 70,
  match: 110,
  miss: 160,
  combo: 180,
  round: 450,
  win: 900,
  lose: 900,
}

function playTone(id: MemorySoundId) {
  switch (id) {
    case 'flip':
      tone(540, 0.055, 'triangle', 0.07, 720)
      break
    case 'match':
      tone(680, 0.1, 'sine', 0.085, 940)
      tone(900, 0.12, 'sine', 0.06, undefined, 0.04)
      break
    case 'miss':
      tone(240, 0.13, 'sawtooth', 0.055, 170)
      break
    case 'combo':
      tone(780, 0.085, 'triangle', 0.065, 1020)
      tone(1040, 0.1, 'sine', 0.05, undefined, 0.05)
      break
    case 'round':
      tone(460, 0.14, 'sine', 0.075, 680)
      tone(580, 0.12, 'sine', 0.055, undefined, 0.08)
      break
    case 'win':
      tone(523, 0.12, 'sine', 0.08)
      tone(659, 0.12, 'sine', 0.07, undefined, 0.1)
      tone(784, 0.2, 'sine', 0.075, undefined, 0.2)
      break
    case 'lose':
      tone(350, 0.18, 'triangle', 0.06, 190)
      tone(260, 0.22, 'sine', 0.05, undefined, 0.1)
      break
    default:
      break
  }
}

export function playMemoryDuelSound(id: MemorySoundId) {
  const ctx = getCtx()
  if (!ctx || !unlocked) return
  if (ctx.state === 'suspended') {
    void ctx.resume().then(() => playMemoryDuelSound(id))
    return
  }

  const now = performance.now()
  if (lastPlayed[id] && now - lastPlayed[id]! < MIN_GAP[id]) return
  lastPlayed[id] = now
  playTone(id)
}
