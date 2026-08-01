let notificationAudio = null
let playAudioUnlocked = false

const unlock = () => {
  notificationAudio = new Audio('/sounds/notification.mp3')
  notificationAudio
    .play()
    .then(() => {
      notificationAudio.pause()
      notificationAudio.currentTime = 0
      playAudioUnlocked = true
    })
    .catch(() => {})
  window.removeEventListener('click', unlock)
}

window.addEventListener('click', unlock)

export const useNotificationSound = () => {
  const play = () => {
    if (!playAudioUnlocked || !notificationAudio) return
    notificationAudio.currentTime = 0
    notificationAudio.play().catch(() => {})
  }

  return { play }
}
