// Qo'ng'iroq signallari telefon standarti bo'yicha (ITU/O'zbekiston, 425 Hz) — WebAudio, fayl kerak emas.

const TONE_HZ = 425
const VOLUME = 0.12

let ctx = null
let loopTimer = null
let active = []

const audio = () => {
  if (!ctx || ctx.state === 'closed') ctx = new AudioContext()
  // Brauzer avtoijro siyosati: foydalanuvchi sahifa bilan ishlagan bo'lsa ovoz ochiladi.
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// Bitta ohang: yumshoq kirish/chiqish bilan (chertish eshitilmasin).
const tone = (freqs, start, length, volume = VOLUME) => {
  const c = audio()
  const gain = c.createGain()
  gain.gain.setValueAtTime(0.0001, c.currentTime + start)
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + start + 0.015)
  gain.gain.setValueAtTime(volume, c.currentTime + start + length - 0.015)
  gain.gain.linearRampToValueAtTime(0.0001, c.currentTime + start + length)
  gain.connect(c.destination)
  for (const f of [].concat(freqs)) {
    const osc = c.createOscillator()
    osc.frequency.value = f
    osc.connect(gain)
    osc.start(c.currentTime + start)
    osc.stop(c.currentTime + start + length + 0.02)
    osc.onended = () => (active = active.filter((x) => x !== osc))
    active.push(osc)
  }
}

const loop = (play, periodMs) => {
  stop()
  play()
  loopTimer = setInterval(play, periodMs)
}

// Chiquvchi kutish signali: 1 s ovoz / 4 s jim.
const ringback = () => loop(() => tone(TONE_HZ, 0, 1), 5000)

// Kiruvchi jiringlash: klassik ikki tonli «trill» (1,2 s) + 2 s jim.
const ringtone = () =>
  loop(() => {
    for (let i = 0; i < 24; i++) tone(i % 2 ? 1100 : 880, i * 0.05, 0.05, 0.08)
  }, 3200)

// Band / javobsiz: 0,35 s ovoz / 0,35 s jim, 4 marta.
const busy = () => {
  stop()
  for (let i = 0; i < 4; i++) tone(TONE_HZ, i * 0.7, 0.35)
}

const stop = () => {
  clearInterval(loopTimer)
  loopTimer = null
  active.forEach((o) => {
    try {
      o.stop()
    } catch {
      // allaqachon to'xtagan
    }
  })
  active = []
}

export const callSounds = { ringback, ringtone, busy, stop }
