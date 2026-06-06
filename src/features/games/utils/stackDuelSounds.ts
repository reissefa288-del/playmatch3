type StackSoundId = 'move' | 'drop' | 'perfect' | 'miss' | 'life' | 'round' | 'win' | 'lose'

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

export function unlockStackDuelAudio() {
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

const lastPlayed: Partial<Record<StackSoundId, number>> = {}
const MIN_GAP: Record<StackSoundId, number> = {
  move: 60,
  drop: 100,
  perfect: 140,
  miss: 200,
  life: 320,
  round: 500,
  win: 900,
  lose: 900,
}

export function playStackDuelSound(id: StackSoundId) {
  const now = performance.now()
  if (lastPlayed[id] && now - lastPlayed[id]! < MIN_GAP[id]) return
  lastPlayed[id] = now

  switch (id) {
    case 'move':
      tone(380, 0.04, 'triangle', 0.03)
      break
    case 'drop':
      tone(480, 0.08, 'sine', 0.05, 320)
      break
    case 'perfect':
      tone(620, 0.1, 'sine', 0.07, 880)
      tone(980, 0.12, 'sine', 0.05, undefined, 0.05)
      break
    case 'miss':
      tone(180, 0.16, 'sawtooth', 0.04, 120)
      break
    case 'life':
      tone(520, 0.1, 'sine', 0.06, 780)
      tone(880, 0.14, 'sine', 0.05, undefined, 0.08)
      break
    case 'round':
      tone(440, 0.14, 'sine', 0.06, 660)
      break
    case 'win':
      tone(523, 0.12, 'sine', 0.07)
      tone(784, 0.18, 'sine', 0.07, undefined, 0.12)
      break
    case 'lose':
      tone(300, 0.2, 'triangle', 0.05, 180)
      break
    default:
      break
  }
}
