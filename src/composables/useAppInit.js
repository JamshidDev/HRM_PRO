import {useAppStore, useSocketStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"

export const useAppInit = () => {
    const appStore = useAppStore()
    const socketStore = useSocketStore()

    onMounted(() => {
        const token = localStorage.getItem(useAppSetting.tokenKey)
        const userId = localStorage.getItem(useAppSetting.accountUserId)
        appStore.initApp()
        socketStore.initSocket(token, userId)
    })

    onBeforeUnmount(() => {
        socketStore.disconnect()
    })


}