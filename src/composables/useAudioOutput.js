import { ref } from 'vue'
import i18n from '@/i18n/index.js'
import { useNotify } from '@/composables/useNotify.js'

// null = aniqlanmagan (brauzer ma'lumot bermaydi) — bu holda ovoz ishlaydi deb qaraladi va
// ogohlantirish CHIQARILMAYDI. Faqat `false` — apparat yo'qligi/playback muvaffaqiyatsizligi tasdiqlangan.
export const audioOutputAvailable = ref(null)

// 'no-device' | 'playback-failed' — ogohlantirish matnini tanlash uchun
export const audioOutputFailureReason = ref(null)

// Ogohlantirish sessiyada bir marta chiqadi; apparat qaytsa (false → true) qayta ochiladi.
let warned = false

const AudioContextCtor = () => window.AudioContext || window.webkitAudioContext

// AudioContext'ni user gesture'dan OLDIN yaratsak Chrome konsolga "AudioContext was not allowed to
// start" ogohlantirishini yozadi. Shuning uchun context probe'i birinchi click'dan keyin ishlaydi —
// baribir ovoz ham faqat shundan keyin chiqadi (useNotificationSound'dagi unlock).
let hasUserGesture = false
const GESTURES = ['pointerdown', 'click', 'keydown', 'touchstart']
const onFirstGesture = () => {
  hasUserGesture = true
  GESTURES.forEach((ev) => window.removeEventListener(ev, onFirstGesture))
  checkAudioOutput()
}
GESTURES.forEach((ev) => window.addEventListener(ev, onFirstGesture))

/**
 * Chromium'da output qurilmasi bo'lmasa `destination.maxChannelCount` 0 bo'ladi — eng ishonchli signal.
 * Firefox/Safari bu signalni bermaydi, shuning uchun ular uchun `null` (xulosa yo'q) qaytadi.
 * Har chaqiruvda yangi context ochib, o'qib, darhol yopiladi — brauzerdagi context limitiga urilmaslik uchun.
 */
const probeChannelCount = () => {
  const Ctor = AudioContextCtor()
  if (!Ctor || !hasUserGesture) return null

  let ctx = null
  try {
    ctx = new Ctor()
    const max = ctx.destination?.maxChannelCount
    if (typeof max !== 'number') return null
    return max > 0
  } catch {
    return null
  } finally {
    // close() Promise qaytaradi (eski implementatsiyalarda undefined); xatosi ahamiyatsiz
    ctx?.close?.()?.catch?.(() => {})
  }
}

/**
 * enumerateDevices() YAKKA holda hukm chiqarmaydi: Firefox/Safari `audiooutput` qurilmalarini umuman
 * ro'yxatlamaydi, ya'ni bo'sh ro'yxat "apparat yo'q" degani emas. Faqat channel-count signalini
 * tasdiqlash uchun ishlatiladi.
 */
const probeDeviceList = async () => {
  if (!navigator.mediaDevices?.enumerateDevices) return null
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    if (!devices?.length) return null
    const hasOutputKind = devices.some((d) => d.kind === 'audiooutput')
    return hasOutputKind ? true : null
  } catch {
    return null
  }
}

const setAvailability = (value, reason = null) => {
  const prev = audioOutputAvailable.value
  audioOutputAvailable.value = value
  audioOutputFailureReason.value = value === false ? reason : null
  // Apparat qaytdi — keyinroq muammo takrorlansa yana ogohlantiriladi
  if (prev === false && value !== false) warned = false
}

/**
 * Apparat holatini tekshiradi va `audioOutputAvailable` ni yangilaydi.
 * @returns {Promise<boolean|null>}
 */
export const checkAudioOutput = async () => {
  const byChannels = probeChannelCount()

  if (byChannels === true) {
    setAvailability(true)
    return true
  }

  if (byChannels === false) {
    // Qurilma ro'yxati ham tasdiqlasa yoki xulosa bermasa — apparat yo'q
    const byDevices = await probeDeviceList()
    if (byDevices === true) {
      // Qarama-qarshi signal: qurilma ko'rinadi, lekin kanal yo'q — xulosa chiqarmaymiz
      setAvailability(null)
      return null
    }
    setAvailability(false, 'no-device')
    return false
  }

  // Brauzer ma'lumot bermadi — avval tasdiqlangan nosozlik bo'lsa uni saqlab qolamiz
  if (audioOutputAvailable.value !== false) setAvailability(null)
  return audioOutputAvailable.value
}

/**
 * Haqiqiy playback xatosi — Firefox/Safari uchun asosiy signal.
 * NotAllowedError (autoplay policy) va AbortError (tezkor qayta-play) apparat muammosi emas.
 */
export const reportPlaybackFailure = (err) => {
  const name = err?.name
  if (name === 'NotAllowedError' || name === 'AbortError') return
  setAvailability(false, 'playback-failed')
}

/**
 * Ovozsiz ogohlantirish. `$Toast.warning` ISHLATILMAYDI — u ovoz chiqaradi (ToastProvider.vue patch qilgan),
 * bu esa play → xato → warning → play cheksiz halqasiga olib keladi. `useNotify()` ovoz chiqarmaydi.
 */
export const warnIfUnavailable = () => {
  if (warned || audioOutputAvailable.value !== false) return
  warned = true
  const key =
    audioOutputFailureReason.value === 'playback-failed'
      ? 'content.soundPlaybackFailed'
      : 'content.soundDeviceMissing'
  // t() chaqirilganda o'qiladi — til almashsa matn ham to'g'ri bo'lishi uchun
  useNotify().notify(i18n.global.t(key), 'warning', { duration: 6000 })
}

navigator.mediaDevices?.addEventListener?.('devicechange', () => {
  checkAudioOutput()
})

export const useAudioOutput = () => ({
  audioOutputAvailable,
  audioOutputFailureReason,
  checkAudioOutput,
  reportPlaybackFailure,
  warnIfUnavailable
})
