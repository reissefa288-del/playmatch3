type MathSoundId = 'tap' | 'correct' | 'wrong' | 'power' | 'round' | 'win' | 'lose'

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

export function unlockMathDuelAudio() {
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

const lastPlayed: Partial<Record<MathSoundId, number>> = {}
const MIN_GAP: Record<MathSoundId, number> = {
  tap: 60,
  correct: 140,
  wrong: 180,
  power: 220,
  round: 500,
  win: 900,
  lose: 900,
}

export function playMathDuelSound(id: MathSoundId) {
  const now = performance.now()
  if (lastPlayed[id] && now - lastPlayed[id]! < MIN_GAP[id]) return
  lastPlayed[id] = now

  switch (id) {
    case 'tap':
      tone(640, 0.05, 'sine', 0.04, 720)
      break
    case 'correct':
      tone(520, 0.08, 'triangle', 0.06, 880)
      tone(780, 0.1, 'sine', 0.04, 1040, 0.06)
      break
    case 'wrong':
      tone(220, 0.12, 'sawtooth', 0.05, 140)
      break
    case 'power':
      tone(400, 0.1, 'square', 0.04, 620)
      break
    case 'round':
      tone(440, 0.12, 'triangle', 0.05, 660)
      break
    case 'win':
      tone(523, 0.1, 'triangle', 0.05, 784, 0)
      tone(659, 0.12, 'triangle', 0.05, 988, 0.12)
      break
    case 'lose':
      tone(180, 0.18, 'sawtooth', 0.05, 120)
      break
  }
}
