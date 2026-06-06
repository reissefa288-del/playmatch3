export type RiftWardSoundId =
  | 'pulse'
  | 'burst'
  | 'shardKill'
  | 'nodeLost'
  | 'combo'
  | 'waveUp'
  | 'start'
  | 'legWin'
  | 'legLose'
  | 'legDraw'
  | 'matchWin'
  | 'matchLose'
  | 'matchDraw'

let audioCtx: AudioContext | null = null
let unlocked = false
let ambientGain: GainNode | null = null
let ambientOscs: OscillatorNode[] = []
let ambientLfo: OscillatorNode | null = null

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

export function unlockRiftWardAudio() {
  const ctx = getCtx()
  if (!ctx || unlocked) return
  unlocked = true
  if (ctx.state === 'suspended') void ctx.resume()
}

export function startRiftWardAmbient() {
  const ctx = getCtx()
  if (!ctx || !unlocked || ambientGain) return
  if (ctx.state === 'suspended') {
    void ctx.resume().then(() => startRiftWardAmbient())
    return
  }

  const master = ctx.createGain()
  master.gain.value = 0.028
  master.connect(ctx.destination)

  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.12
  const lfoAmp = ctx.createGain()
  lfoAmp.gain.value = 0.012
  lfo.connect(lfoAmp)
  lfoAmp.connect(master.gain)
  lfo.start()

  const freqs = [55, 82.5, 110]
  const oscs = freqs.map((freq) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const amp = ctx.createGain()
    amp.gain.value = freq === 55 ? 0.5 : 0.28
    osc.connect(amp)
    amp.connect(master)
    osc.start()
    return osc
  })

  ambientGain = master
  ambientOscs = oscs
  ambientLfo = lfo
}

export function stopRiftWardAmbient() {
  const ctx = getCtx()
  if (!ctx || !ambientGain) return

  const t = ctx.currentTime
  ambientGain.gain.cancelScheduledValues(t)
  ambientGain.gain.setValueAtTime(ambientGain.gain.value, t)
  ambientGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)

  window.setTimeout(() => {
    for (const osc of ambientOscs) {
      try {
        osc.stop()
      } catch {
        /* already stopped */
      }
    }
    if (ambientLfo) {
      try {
        ambientLfo.stop()
      } catch {
        /* already stopped */
      }
    }
    ambientOscs = []
    ambientLfo = null
    ambientGain = null
  }, 650)
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
  if (ctx.state === 'suspended') {
    void ctx.resume().then(() => tone(freq, duration, type, gain, slideTo, delay))
    return
  }
  const t0 = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(24, slideTo), t0 + duration)
  amp.gain.setValueAtTime(gain, t0)
  amp.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

function noiseBurst(duration: number, gain: number, delay = 0) {
  const ctx = getCtx()
  if (!ctx || !unlocked) return
  const t0 = ctx.currentTime + delay
  const bufferSize = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 680
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(gain, t0)
  amp.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  src.connect(filter)
  filter.connect(amp)
  amp.connect(ctx.destination)
  src.start(t0)
  src.stop(t0 + duration + 0.02)
}

const lastPlayed: Partial<Record<RiftWardSoundId, number>> = {}
const MIN_GAP_MS: Record<RiftWardSoundId, number> = {
  pulse: 70,
  burst: 55,
  shardKill: 45,
  nodeLost: 280,
  combo: 120,
  waveUp: 600,
  start: 500,
  legWin: 700,
  legLose: 700,
  legDraw: 700,
  matchWin: 900,
  matchLose: 900,
  matchDraw: 900,
}

export function playRiftWardSound(id: RiftWardSoundId) {
  const now = performance.now()
  const gap = MIN_GAP_MS[id]
  if (lastPlayed[id] && now - lastPlayed[id]! < gap) return
  lastPlayed[id] = now

  switch (id) {
    case 'pulse':
      tone(520, 0.06, 'sine', 0.042, 880)
      tone(880, 0.04, 'triangle', 0.028, 1200, 0.03)
      break
    case 'burst':
      tone(240, 0.08, 'sine', 0.038, 90)
      noiseBurst(0.07, 0.022, 0.02)
      tone(680, 0.05, 'triangle', 0.025, 320, 0.04)
      break
    case 'shardKill':
      tone(760, 0.05, 'triangle', 0.032, 420)
      tone(420, 0.04, 'sine', 0.02, 180, 0.03)
      break
    case 'nodeLost':
      tone(180, 0.16, 'sawtooth', 0.048, 70)
      tone(110, 0.2, 'square', 0.035, 45, 0.08)
      noiseBurst(0.12, 0.028, 0.05)
      break
    case 'combo':
      tone(620, 0.06, 'triangle', 0.04, 880)
      tone(880, 0.05, 'sine', 0.032, 1100, 0.05)
      break
    case 'waveUp':
      tone(330, 0.08, 'sine', 0.038, 440)
      tone(440, 0.1, 'triangle', 0.035, 660, 0.09)
      tone(660, 0.12, 'sine', 0.03, undefined, 0.18)
      break
    case 'start':
      tone(220, 0.1, 'sine', 0.038, 330)
      tone(330, 0.12, 'triangle', 0.032, 440, 0.08)
      tone(440, 0.14, 'sine', 0.028, undefined, 0.16)
      break
    case 'legWin':
      tone(440, 0.1, 'sine', 0.05)
      tone(554, 0.1, 'sine', 0.045, undefined, 0.1)
      tone(659, 0.14, 'triangle', 0.04, undefined, 0.2)
      break
    case 'legLose':
      tone(330, 0.14, 'sawtooth', 0.042, 220)
      tone(247, 0.18, 'sine', 0.032, 165, 0.12)
      break
    case 'legDraw':
      tone(392, 0.11, 'sine', 0.045)
      tone(392, 0.11, 'sine', 0.04, undefined, 0.13)
      break
    case 'matchWin':
      tone(523, 0.1, 'sine', 0.055)
      tone(659, 0.1, 'sine', 0.05, undefined, 0.1)
      tone(784, 0.12, 'sine', 0.045, undefined, 0.2)
      tone(988, 0.16, 'triangle', 0.04, undefined, 0.32)
      break
    case 'matchLose':
      tone(440, 0.14, 'sawtooth', 0.045, 220)
      tone(330, 0.2, 'sine', 0.035, 165, 0.12)
      break
    case 'matchDraw':
      tone(440, 0.12, 'sine', 0.048)
      tone(440, 0.12, 'sine', 0.042, undefined, 0.14)
      break
    default:
      break
  }
}
