import { useAppStore, useSocketStore } from '@/store/modules/index.js'
import { useAppSetting } from '@/utils/index.js'
import { checkAudioOutput } from '@/composables/useAudioOutput.js'

export const useAppInit = () => {
  const appStore = useAppStore()
  const socketStore = useSocketStore()

  onMounted(() => {
    const token = localStorage.getItem(useAppSetting.tokenKey)
    const userId = localStorage.getItem(useAppSetting.accountUserId)
    appStore.initApp()
    socketStore.initSocket(token, userId)
    // Ovoz chiqaruvchi apparat bor-yo'qligini boshida bir marta tekshiramiz
    checkAudioOutput()
  })

  onBeforeUnmount(() => {
    socketStore.disconnect()
  })
}
