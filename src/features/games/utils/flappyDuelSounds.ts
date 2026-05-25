type FlappySoundId = 'flap' | 'score' | 'crash' | 'round' | 'win' | 'lose'

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

export function unlockFlappyDuelAudio() {
  const ctx = getCtx()
  if (!ctx || unlocked) return
  unlocked = true
  if (ctx.state === 'suspended') void ctx.resume()
}

function tone(freq: number, duration: number, type: OscillatorType, gain: number, slideTo?: number) {
  const ctx = getCtx()
  if (!ctx || !unlocked) return
  const start = ctx.currentTime
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

const lastPlayed: Partial<Record<FlappySoundId, number>> = {}
const MIN_GAP: Record<FlappySoundId, number> = {
  flap: 70,
  score: 120,
  crash: 200,
  round: 500,
  win: 900,
  lose: 900,
}

export function playFlappyDuelSound(id: FlappySoundId) {
  const now = performance.now()
  if (lastPlayed[id] && now - lastPlayed[id]! < MIN_GAP[id]) return
  lastPlayed[id] = now

  switch (id) {
    case 'flap':
      tone(380, 0.06, 'square', 0.04, 520)
      break
    case 'score':
      tone(660, 0.08, 'triangle', 0.05, 880)
      break
    case 'crash':
      tone(140, 0.14, 'sawtooth', 0.05, 90)
      break
    case 'round':
      tone(440, 0.1, 'triangle', 0.05, 620)
      break
    case 'win':
      tone(523, 0.1, 'triangle', 0.05, 784)
      tone(659, 0.12, 'triangle', 0.04, 988)
      break
    case 'lose':
      tone(180, 0.16, 'sawtooth', 0.05, 120)
      break
  }
}
