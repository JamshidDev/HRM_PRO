// Live chat API tanlovi: VITE_LIVE_CHAT_MOCK=true — soxta server (backendsiz UI sinovi), aks holda real backend.
import { createMockChatApi } from './mockChatApi.js'
import { createRealChatApi } from './realChatApi.js'

export const LIVE_CHAT_MOCK = import.meta.env.VITE_LIVE_CHAT_MOCK === 'true'

let instance = null
export const liveChatApi = () => (instance ??= LIVE_CHAT_MOCK ? createMockChatApi() : createRealChatApi())
