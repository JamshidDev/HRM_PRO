const soundFiles = {
  success: '/sounds/notification.mp3',
  error: '/sounds/error.wav',
  notice: '/sounds/notice.wav'
}

const audioCache = {}
let playAudioUnlocked = false

const getAudio = (type) => {
  const src = soundFiles[type] || soundFiles.success
  if (!audioCache[src]) {
    audioCache[src] = new Audio(src)
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
    })
    .catch(() => {})
  window.removeEventListener('click', unlock)
}

window.addEventListener('click', unlock)

export const useNotificationSound = () => {
  const play = (type = 'success') => {
    if (!playAudioUnlocked) return
    const audio = getAudio(type)
    audio.currentTime = 0
    audio.play().catch(() => {})
  }

  return { play }
}
