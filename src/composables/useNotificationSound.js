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

const unlock = () => {
  const audio = getAudio('success')
  audio
    .play()
    .then(() => {
      audio.pause()
      audio.currentTime = 0
      playAudioUnlocked = true
      window.removeEventListener('click', unlock)
    })
    .catch((err) => {
      // NotAllowedError — click hali yaroqli gesture sanalmadi; listener qoladi va keyingi click'da qayta urinadi
      if (err?.name === 'NotAllowedError') return
      window.removeEventListener('click', unlock)
      onPlaybackError(err)
    })
}

window.addEventListener('click', unlock)

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
