import {
  audioOutputAvailable,
  reportPlaybackFailure,
  warnIfUnavailable
} from '@/composables/useAudioOutput.js'

const soundFiles = {
  success: '/sounds/notification.mp3',
  error: '/sounds/error.wav',
  notice: '/sounds/notice.wav'
}

const audioCache = {}
let playAudioUnlocked = false

const onPlaybackError = (err) => {
  reportPlaybackFailure(err)
  warnIfUnavailable()
}

const getAudio = (type) => {
  const src = soundFiles[type] || soundFiles.success
  if (!audioCache[src]) {
    const audio = new Audio(src)
    // Fayl topilmasa / dekod qilinmasa play() reject bo'lmasligi mumkin — element'ning error event'i qoplaydi
    audio.addEventListener('error', () => {
      onPlaybackError(audio.error)
    })
    audioCache[src] = audio
  }
  return audioCache[src]
}

// Autoplay qulfi: faqat click emas — klaviatura/skroll/teginish ham gesture sanaladi,
// aks holda sahifa yangilangach birinchi bosishgacha bildirishnoma ovozsiz qoladi.
const GESTURES = ['pointerdown', 'click', 'keydown', 'touchstart']
const removeGestureListeners = () => {
  GESTURES.forEach((ev) => window.removeEventListener(ev, unlock))
}

function unlock() {
  const audio = getAudio('success')
  audio.muted = true
  audio
    .play()
    .then(() => {
      audio.pause()
      audio.currentTime = 0
      audio.muted = false
      playAudioUnlocked = true
      removeGestureListeners()
    })
    .catch((err) => {
      audio.muted = false
      // NotAllowedError — bu gesture yaroqli sanalmadi; listener qoladi va keyingisida qayta urinadi
      if (err?.name === 'NotAllowedError') return
      removeGestureListeners()
      onPlaybackError(err)
    })
}

GESTURES.forEach((ev) => window.addEventListener(ev, unlock))

export const useNotificationSound = () => {
  const play = (type = 'success') => {
    // Apparat yo'qligi tasdiqlangan — bekorga urinmaymiz, faqat ogohlantiramiz
    if (audioOutputAvailable.value === false) {
      warnIfUnavailable()
      return
    }
    // Autoplay policy hali ochilmagan — bu apparat muammosi emas, jim o'tamiz
    if (!playAudioUnlocked) return

    const audio = getAudio(type)
    audio.currentTime = 0
    audio.play().catch(onPlaybackError)
  }

  return { play }
}
