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

const lastPlayed: Partial<Record<MemorySoundId, number>> = {}
const MIN_GAP: Record<MemorySoundId, number> = {
  flip: 80,
  match: 120,
  miss: 180,
  combo: 200,
  round: 500,
  win: 900,
  lose: 900,
}

export function playMemoryDuelSound(id: MemorySoundId) {
  const now = performance.now()
  if (lastPlayed[id] && now - lastPlayed[id]! < MIN_GAP[id]) return
  lastPlayed[id] = now

  switch (id) {
    case 'flip':
      tone(520, 0.06, 'triangle', 0.05, 680)
      break
    case 'match':
      tone(660, 0.1, 'sine', 0.07, 920)
      tone(880, 0.12, 'sine', 0.05, undefined, 0.04)
      break
    case 'miss':
      tone(220, 0.14, 'sawtooth', 0.04, 160)
      break
    case 'combo':
      tone(740, 0.08, 'triangle', 0.05, 980)
      break
    case 'round':
      tone(440, 0.16, 'sine', 0.06, 660)
      break
    case 'win':
      tone(523, 0.12, 'sine', 0.07)
      tone(659, 0.12, 'sine', 0.06, undefined, 0.1)
      tone(784, 0.18, 'sine', 0.07, undefined, 0.2)
      break
    case 'lose':
      tone(330, 0.2, 'triangle', 0.05, 180)
      break
    default:
      break
  }
}
