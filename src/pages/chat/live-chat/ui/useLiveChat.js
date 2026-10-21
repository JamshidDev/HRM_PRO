import { computed, ref } from 'vue'
import { useLiveChatStore } from '@/store/modules/chat/liveChatStore.js'

// Sahifa adapteri: ma'lumot liveChatStore'da (mock yoki real API), bu yerda faqat UI holati (javob, profil).
export const useLiveChat = () => {
  const store = useLiveChatStore()

  const replyMessage = ref(null)
  const setReplyMessage = (message) => {
    replyMessage.value = message
  }
  const clearReply = () => {
    replyMessage.value = null
  }
  const takeReply = () => {
    const r = replyMessage.value
    replyMessage.value = null
    return r
  }

  const showProfile = ref(false)
  const profileUser = ref(null)
  const openProfile = (user) => {
    if (!user) return
    profileUser.value = user
    showProfile.value = true
  }
  const closeProfile = () => {
    showProfile.value = false
  }

  const meId = computed(() => store.meId)
  const userList = computed(() => store.sortedConversations)
  const selectedUserId = computed(() => store.selectedId)
  const selectedUser = computed(() => store.selected)
  const messages = computed(() => store.selectedMessages)
  const search = computed(() => store.search)
  const listLoading = computed(() => store.listLoading)
  const hasMore = computed(() => !!store.hasMore[store.selectedId])
  const loadingOlder = computed(() => !!store.loadingOlder[store.selectedId])
  const loadingMessages = computed(() => !!store.loadingMessages[store.selectedId])
  const peerTyping = computed(() => store.isTyping(store.selectedId))
  const isTyping = (id) => store.isTyping(id)
  const isOwn = (message) => message?.senderId === store.meId

  let searchTimer = null
  const setSearch = (value) => {
    store.search = value || ''
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => store.setSearch(value), 300)
  }

  const selectUser = (id) => {
    replyMessage.value = null
    store.select(id)
  }

  // Mobil: suhbatdan ro'yxatga qaytish.
  const closeChat = () => {
    replyMessage.value = null
    showProfile.value = false
    store.select(null)
  }

  return {
    meId,
    isOwn,
    search,
    listLoading,
    userList,
    selectedUserId,
    selectedUser,
    messages,
    hasMore,
    loadingOlder,
    loadingMessages,
    peerTyping,
    isTyping,
    showProfile,
    profileUser,
    openProfile,
    closeProfile,
    setSearch,
    selectUser,
    closeChat,
    openWithUser: (user) => {
      replyMessage.value = null
      return store.openWithUser(user)
    },
    searchUsers: (term) => store.searchUsers(term),
    loadOlder: () => store.loadOlder(store.selectedId),
    loadMedia: (id) => store.loadMedia(id),
    togglePinChat: (id) => store.togglePin(id),
    deleteChat: (id) => store.deleteChat(id),
    clearHistory: (id) => store.clearHistory(id),
    replyMessage,
    setReplyMessage,
    clearReply,
    sendText: (text) => store.sendText(text, takeReply()),
    sendFiles: (files) => store.sendFiles(files, takeReply()),
    sendVoice: (blob, duration, waveform) => store.sendVoice(blob, duration, waveform, takeReply()),
    sendTyping: () => store.sendTyping(),
    retryMessage: (message) => store.retry(message),
    editMessage: (messageId, text) => store.editMessage(messageId, text),
    deleteMessage: (message) => store.deleteMessage(message),
    forwardMessage: (message, conversationId) => store.forward(message, conversationId),
    toggleReaction: (messageId, emoji) => store.react(messageId, emoji)
  }
}
