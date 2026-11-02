// Qo'ng'iroq signallari — haqiqiy yozuvlar (public/sounds/call-*.mp3, mualliflar: public/sounds/CREDITS.txt).

const SRC = {
  ringtone: '/sounds/call-ringtone.mp3',
  ringback: '/sounds/call-ringback.mp3',
  busy: '/sounds/call-busy.mp3'
}
const VOLUME = 0.6
// Tugash signali — band ovozining boshidan qisqa bo'lak (3 ta «tu»).
const HANGUP_MS = 2500
const BUSY_MS = 3000

const cache = {}
let current = null
let cutTimer = null

const audioOf = (key) => {
  cache[key] ??= Object.assign(new Audio(SRC[key]), { preload: 'auto', volume: VOLUME })
  return cache[key]
}

// Brauzer avtoijroni bloklasa (sahifa bilan hali ishlanmagan) — jim o'tadi, xato chiqarmaydi.
const play = (key, { loop = false, maxMs = 0 } = {}) => {
  stop()
  const a = audioOf(key)
  a.loop = loop
  a.currentTime = 0
  a.play().catch(() => {})
  current = a
  if (maxMs) cutTimer = setTimeout(stop, maxMs)
}

const stop = () => {
  clearTimeout(cutTimer)
  cutTimer = null
  if (current) {
    current.pause()
    current.currentTime = 0
  }
  current = null
}

export const callSounds = {
  ringtone: () => play('ringtone', { loop: true }),
  ringback: () => play('ringback', { loop: true }),
  busy: () => play('busy', { maxMs: BUSY_MS }),
  hangup: () => play('busy', { maxMs: HANGUP_MS }),
  stop
}
