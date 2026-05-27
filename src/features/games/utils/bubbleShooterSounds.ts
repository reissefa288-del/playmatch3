export type BubbleSoundId = 'shoot' | 'pop' | 'swap' | 'overflow' | 'point' | 'round' | 'win' | 'lose'

let audioCtx: AudioContext | null = null
let unlocked = false
let lastAt = 0

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
  if (!ctx) return
  unlocked = true
  if (ctx.state === 'suspended') void ctx.resume()
}

function playTone() {
  const ctx = getCtx()
  if (!ctx || !unlocked) return
  if (ctx.state === 'suspended') {
    void ctx.resume().then(() => playTone())
    return
  }

  const start = ctx.currentTime
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  const freq = 520 + Math.random() * 60
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, start)
  osc.frequency.exponentialRampToValueAtTime(280, start + 0.06)
  amp.gain.setValueAtTime(0.09, start)
  amp.gain.exponentialRampToValueAtTime(0.001, start + 0.07)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + 0.08)
}

/** Tüm oyun olayları için tek kısa “pop” sesi (önceki Web Audio tonu) */
export function playBubbleSound(_id?: BubbleSoundId) {
  const now = performance.now()
  if (now - lastAt < 38) return
  lastAt = now
  playTone()
}

export function playBubbleSoundOnGesture(_id?: BubbleSoundId) {
  unlockBubbleAudio()
  const now = performance.now()
  if (now - lastAt < 38) return
  lastAt = now
  playTone()
}
