import { reactive, ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { CURRENT_USER_ID, USERS, INITIAL_MESSAGES, AUTO_REPLIES } from './mockData.js'
import { messagePreviewLabel } from './format.js'

const combineFullName = (u) => [u.lastName, u.firstName, u.middleName].filter(Boolean).join(' ')

/**
 * Hozircha hammasi frontendda (hardcoded) — backend ulanganda faqat shu
 * composable ichidagi funksiyalar API chaqiruvlariga almashtiriladi,
 * page/ui komponentlari o'zgarishsiz qoladi.
 */
export const useLiveChat = () => {
  // `fullName` shu yerda darhol biriktiriladi — aks holda faqat `userList`
  // (sidebar) uni hisoblardi, `selectedUser` (header) esa xom `users`dan
  // o'qigani uchun ismsiz qolardi.
  const users = reactive(
    USERS.map((u) => ({ ...u, unreadCount: 0, pinned: false, fullName: combineFullName(u) }))
  )
  const messagesByUser = reactive(
    Object.fromEntries(Object.entries(INITIAL_MESSAGES).map(([id, list]) => [id, [...list]]))
  )
  // Boshlang'ich o'qilmagan sonlari — oxirgi xabar boshqa foydalanuvchidan bo'lsa.
  users.forEach((u) => {
    const list = messagesByUser[u.id] || []
    const last = list[list.length - 1]
    if (last && last.senderId !== CURRENT_USER_ID) u.unreadCount = 1
  })

  // Sidebar ro'yxatidan "o'chirilgan" suhbatlar — haqiqiy xabarlar/foydalanuvchi
  // ma'lumoti saqlanib qoladi, faqat ro'yxatdan yashiriladi (Telegram'dagi
  // "Delete chat"ga o'xshab — bu yerda backend/real ma'lumot yo'q).
  const hiddenUserIds = reactive(new Set())

  const selectedUserId = ref(null)
  const search = ref('')

  // Javob yozish uchun tanlangan xabar — kompozitsiya panelida ko'rsatiladi,
  // yuborilgandan keyin (yoki bekor qilinganda) tozalanadi.
  const replyMessage = ref(null)

  const setReplyMessage = (message) => {
    replyMessage.value = message
  }

  const clearReply = () => {
    replyMessage.value = null
  }

  // Yuborilayotgan xabarga qo'shiladigan "javob" bo'lagi — asl xabar keyinroq
  // o'chirilsa ham ko'rinishda qolishi uchun snapshot sifatida saqlanadi.
  const takeReplySnapshot = () => {
    if (!replyMessage.value) return null
    const src = replyMessage.value
    const snapshot = {
      id: src.id,
      senderId: src.senderId,
      type: src.type,
      text: src.type === 'text' ? src.text : null,
      fileName: src.fileName || null
    }
    replyMessage.value = null
    return snapshot
  }

  // Profil oynasi — header'dagi yoki xabar yonidagi istalgan avatar bosilganda
  // ochiladi (o'zining yoki suhbatdoshning).
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

  const selectedUser = computed(() => users.find((u) => u.id === selectedUserId.value) || null)
  const messages = computed(() => messagesByUser[selectedUserId.value] || [])

  const userList = computed(() => {
    const term = search.value.trim().toLowerCase()
    return users
      .filter((u) => !hiddenUserIds.has(u.id))
      .map((u) => {
        const list = messagesByUser[u.id] || []
        const last = list[list.length - 1]
        return {
          ...u,
          lastMessage: messagePreviewLabel(last),
          lastMessageAt: last?.createdAt || null
        }
      })
      .filter((u) => !term || u.fullName.toLowerCase().includes(term))
      // Qadalgan (pinned) suhbatlar har doim tepada — ular orasida ham,
      // qolganlar orasida ham oxirgi xabar vaqti bo'yicha kamayish tartibida.
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
      })
  })

  const setSearch = (value) => {
    search.value = value || ''
  }

  const selectUser = (id) => {
    selectedUserId.value = id
    replyMessage.value = null
    const user = users.find((u) => u.id === id)
    if (user) user.unreadCount = 0
  }

  const togglePinChat = (id) => {
    const user = users.find((u) => u.id === id)
    if (user) user.pinned = !user.pinned
  }

  // Faqat SIDEBAR ro'yxatidan yo'qoladi — xabarlar/foydalanuvchi o'zi
  // (`messagesByUser`, `users`) o'zgarishsiz qoladi. Tanlangan suhbat
  // o'chirilsa, ochiq oyna ham yopiladi (EmptyState ko'rinadi).
  const deleteChat = (id) => {
    hiddenUserIds.add(id)
    if (selectedUserId.value === id) {
      selectedUserId.value = null
      replyMessage.value = null
    }
  }

  // Suhbat ro'yxatda qoladi, faqat xabarlar tarixi tozalanadi.
  const clearHistory = (id) => {
    messagesByUser[id] = []
    const user = users.find((u) => u.id === id)
    if (user) user.unreadCount = 0
  }

  const pushMessage = (userId, message) => {
    if (!messagesByUser[userId]) messagesByUser[userId] = []
    messagesByUser[userId].push(message)
  }

  // Demo: xabar "yetkazilgandan" keyin bir oz o'tib "o'qildi" belgisiga o'tadi.
  const markReadLater = (userId, messageId) => {
    setTimeout(() => {
      const msg = (messagesByUser[userId] || []).find((m) => m.id === messageId)
      if (msg) msg.status = 'read'
    }, 1200)
  }

  // Demo: suhbatdosh bir oz o'tib tasodifiy javob yozadi — real chatga o'xshatish uchun.
  const maybeAutoReply = (userId) => {
    const user = users.find((u) => u.id === userId)
    if (!user?.online) return
    setTimeout(() => {
      pushMessage(userId, {
        id: uuidv4(),
        senderId: userId,
        type: 'text',
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        createdAt: new Date().toISOString()
      })
      if (selectedUserId.value !== userId) user.unreadCount += 1
    }, 1500 + Math.random() * 1000)
  }

  const sendText = (text) => {
    const userId = selectedUserId.value
    if (!userId || !text.trim()) return
    const message = {
      id: uuidv4(),
      senderId: CURRENT_USER_ID,
      type: 'text',
      text: text.trim(),
      replyTo: takeReplySnapshot(),
      createdAt: new Date().toISOString(),
      status: 'sent'
    }
    pushMessage(userId, message)
    markReadLater(userId, message.id)
    maybeAutoReply(userId)
  }

  const sendFiles = (files) => {
    const userId = selectedUserId.value
    if (!userId || !files.length) return
    // Javob faqat shu yuborish amalidagi BIRINCHI faylga biriktiriladi —
    // bir nechta fayl yuborilsa ham javob faqat bitta xabarga tegishli bo'ladi.
    let replySnapshot = takeReplySnapshot()
    files.forEach((file) => {
      const message = {
        id: uuidv4(),
        senderId: CURRENT_USER_ID,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
        replyTo: replySnapshot,
        createdAt: new Date().toISOString(),
        status: 'sent'
      }
      replySnapshot = null
      pushMessage(userId, message)
      markReadLater(userId, message.id)
    })
    maybeAutoReply(userId)
  }

  const sendVoice = (audioUrl, duration, fileSize, waveform) => {
    const userId = selectedUserId.value
    if (!userId) return
    const message = {
      id: uuidv4(),
      senderId: CURRENT_USER_ID,
      type: 'voice',
      audioUrl,
      duration,
      fileSize,
      waveform,
      replyTo: takeReplySnapshot(),
      createdAt: new Date().toISOString(),
      status: 'sent'
    }
    pushMessage(userId, message)
    markReadLater(userId, message.id)
    maybeAutoReply(userId)
  }

  // Faqat matnli xabarlar tahrirlanadi — rasm/fayl/ovozli xabarlarda mazmun yo'q.
  const editMessage = (messageId, text) => {
    const userId = selectedUserId.value
    const msg = (messagesByUser[userId] || []).find((m) => m.id === messageId)
    if (msg && msg.type === 'text' && text.trim()) {
      msg.text = text.trim()
      msg.edited = true
    }
  }

  const deleteMessage = (messageId) => {
    const userId = selectedUserId.value
    if (!messagesByUser[userId]) return
    messagesByUser[userId] = messagesByUser[userId].filter((m) => m.id !== messageId)
  }

  // Xabarni boshqa suhbatga (`targetUserId`) yuboradi — muvaffaqiyatli bo'lsa
  // shu foydalanuvchi id'sini qaytaradi, aks holda `null`.
  const forwardMessage = (messageId, targetUserId) => {
    const sourceUserId = selectedUserId.value
    const original = (messagesByUser[sourceUserId] || []).find((m) => m.id === messageId)
    if (!original || !targetUserId) return null

    const originalSender = users.find((u) => u.id === original.senderId)
    const forwarded = {
      ...original,
      id: uuidv4(),
      senderId: CURRENT_USER_ID,
      createdAt: new Date().toISOString(),
      status: 'sent',
      edited: false,
      replyTo: null,
      reactions: [],
      forwarded: true,
      forwardedFrom:
        original.senderId === CURRENT_USER_ID ? null : originalSender?.fullName || null
    }
    pushMessage(targetUserId, forwarded)
    markReadLater(targetUserId, forwarded.id)
    if (targetUserId === selectedUserId.value) maybeAutoReply(targetUserId)
    return targetUserId
  }

  // Bitta foydalanuvchi bir xabarga faqat bitta reaksiya qo'ya oladi — xuddi shu
  // emoji qayta bosilsa reaksiya olib tashlanadi (toggle), boshqasi bosilsa
  // almashtiriladi (Telegram/WhatsApp'dagi kabi).
  const toggleReaction = (messageId, emoji) => {
    const userId = selectedUserId.value
    const msg = (messagesByUser[userId] || []).find((m) => m.id === messageId)
    if (!msg) return
    if (!msg.reactions) msg.reactions = []
    const mineIndex = msg.reactions.findIndex((r) => r.userId === CURRENT_USER_ID)
    if (mineIndex !== -1 && msg.reactions[mineIndex].emoji === emoji) {
      msg.reactions.splice(mineIndex, 1)
    } else if (mineIndex !== -1) {
      msg.reactions[mineIndex] = { emoji, userId: CURRENT_USER_ID }
    } else {
      msg.reactions.push({ emoji, userId: CURRENT_USER_ID })
    }
  }

  return {
    search,
    userList,
    selectedUserId,
    selectedUser,
    messages,
    showProfile,
    profileUser,
    openProfile,
    closeProfile,
    setSearch,
    selectUser,
    togglePinChat,
    deleteChat,
    clearHistory,
    replyMessage,
    setReplyMessage,
    clearReply,
    sendText,
    sendFiles,
    sendVoice,
    editMessage,
    deleteMessage,
    forwardMessage,
    toggleReaction
  }
}
