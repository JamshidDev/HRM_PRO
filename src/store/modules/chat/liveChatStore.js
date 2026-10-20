import { defineStore } from 'pinia'
import { watch } from 'vue'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import i18n from '@/i18n/index.js'
import { liveChatApi } from '@/pages/chat/live-chat/api/index.js'
import { toConversation, toMessage, toUser } from '@/pages/chat/live-chat/api/mapper.js'
import { messagePreviewLabel } from '@/pages/chat/live-chat/ui/format.js'
import { useAccountStore } from '@/store/modules/app/accountStore.js'
import { useSocketStore } from '@/store/modules/app/socketStore.js'
import { useAppStore } from '@/store/modules/app/appStore.js'
import { useNotify } from '@/composables/useNotify'
import { useNotificationSound } from '@/composables/useNotificationSound.js'

const { t } = i18n.global
const PAGE = 50
const TYPING_SHOW_MS = 4000
const TYPING_SEND_MS = 2500
const LIVE_CHAT_PATH = '/chat/live-chat'
const TOAST_GAP_MS = 5000
const SOUND_GAP_MS = 2000

const isChatPageVisible = () =>
  window.location.pathname.startsWith(LIVE_CHAT_PATH) && document.visibilityState === 'visible'

export const useLiveChatStore = defineStore('liveChatStore', {
  state: () => ({
    inited: false,
    meId: null,
    conversations: [],
    listLoading: false,
    search: '',
    selectedId: null,
    messages: {},
    hasMore: {},
    loadingOlder: {},
    loadingMessages: {},
    typing: {},
    readUpTo: {},
    unreadTotal: 0,
    lastTypingSent: 0
  }),
  getters: {
    sortedConversations: (s) =>
      [...s.conversations].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return String(b.lastMessageAt ?? '').localeCompare(String(a.lastMessageAt ?? ''))
      }),
    selected: (s) => s.conversations.find((c) => c.id === s.selectedId) ?? null,
    selectedMessages: (s) => s.messages[s.selectedId] ?? [],
    isTyping: (s) => (id) => !!s.typing[id]
  },
  actions: {
    api() {
      return liveChatApi()
    },

    // Bir marta: hodisalarni ulaydi va o'qilmaganlar sonini oladi (menyu badge, toast).
    init() {
      if (this.inited) return
      const accountStore = useAccountStore()
      const meId = accountStore.account?.id
      if (!meId || !accountStore.canView('chat-live-chat')) return
      this.inited = true
      this.meId = meId
      const api = this.api()
      api.setMe?.(meId)
      api.attachSocket?.(useSocketStore().socket)
      api.on('chat:message', (d) => this.onMessage(d))
      api.on('chat:message:updated', (d) => this.onUpdated(d))
      api.on('chat:message:deleted', (d) => this.onDeleted(d))
      api.on('chat:read', (d) => this.onRead(d))
      api.on('chat:conversation', (d) => this.upsertConversation(d.conversation))
      api.on('chat:conversation:removed', (d) => this.removeConversation(d.conversation_id))
      api.on('chat:typing', (d) => this.onTyping(d))
      api.on('chat:presence', (d) => this.onPresence(d))
      api.on('reconnect', () => this.resync())
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.selectedId) this.markRead(this.selectedId)
      })
      this.refreshUnread()
    },

    // Har socket ulanishida: birinchisida init, keyingilarida (qayta ulanish) o'tkazib yuborilganlarni yuklash.
    onSocketConnect(socket) {
      this.init()
      if (!this.inited) {
        // Ruxsatlar socketdan keyin yuklanishi mumkin — yuklangach qayta urinamiz.
        const accountStore = useAccountStore()
        const stop = watch(
          () => accountStore.permissionsLoaded && accountStore.account?.id,
          (ready) => {
            if (!ready) return
            stop()
            this.onSocketConnect(socket)
          }
        )
        return
      }
      this.api().attachSocket?.(socket)
      if (this._connectedOnce) this.resync()
      this._connectedOnce = true
    },

    async loadConversations() {
      this.listLoading = true
      try {
        const res = await this.api().conversations({ search: this.search || undefined })
        const list = res.data.map(toConversation)
        // Tanlangan suhbat qidiruvdan tashqarida qolsa ham yo'qolmasin.
        const keep = this.conversations.find((c) => c.id === this.selectedId)
        if (keep && !list.some((c) => c.id === keep.id) && !this.search) list.push(keep)
        this.conversations = list
        list.forEach((c) => this.applyPeerRead(c.id, c.peerLastRead))
      } finally {
        this.listLoading = false
      }
    },

    async setSearch(value) {
      this.search = value || ''
      await this.loadConversations()
    },

    async refreshUnread() {
      try {
        const res = await this.api().unreadCount()
        this.unreadTotal = res.total
      } catch {
        this.unreadTotal = 0
      }
      useSocketStore().updateCount({ chat: { 'live-chat': this.unreadTotal } })
    },

    refreshUnreadLater() {
      clearTimeout(this._unreadTimer)
      this._unreadTimer = setTimeout(() => this.refreshUnread(), 400)
    },

    async select(id) {
      this.selectedId = id
      if (!id) return
      if (!this.messages[id]) await this.loadMessages(id)
      this.markRead(id)
    },

    async loadMessages(id) {
      this.loadingMessages[id] = true
      try {
        const res = await this.api().messages(id, { limit: PAGE })
        this.messages[id] = res.data.map((m) => this.withPeerRead(id, toMessage(m)))
        this.hasMore[id] = res.has_more
      } finally {
        this.loadingMessages[id] = false
      }
    },

    // Yuqoriga scroll: eng eski haqiqiy xabardan oldingilar.
    async loadOlder(id) {
      if (!this.hasMore[id] || this.loadingOlder[id]) return false
      const first = (this.messages[id] ?? []).find((m) => typeof m.id === 'number')
      if (!first) return false
      this.loadingOlder[id] = true
      try {
        const res = await this.api().messages(id, { before_id: first.id, limit: PAGE })
        const known = new Set(this.messages[id].map((m) => m.id))
        const older = res.data.map((m) => this.withPeerRead(id, toMessage(m))).filter((m) => !known.has(m.id))
        this.messages[id] = [...older, ...this.messages[id]]
        this.hasMore[id] = res.has_more
        return true
      } finally {
        this.loadingOlder[id] = false
      }
    },

    // Qayta ulanganda: ro'yxat va ochiq suhbatlardagi o'tkazib yuborilgan xabarlar.
    async resync() {
      await this.loadConversations()
      for (const id of Object.keys(this.messages).map(Number)) {
        const real = this.messages[id].filter((m) => typeof m.id === 'number')
        const last = real[real.length - 1]
        if (!last) continue
        const res = await this.api().messages(id, { after_id: last.id })
        res.data.map(toMessage).forEach((m) => this.addMessage(id, m))
      }
      if (this.selectedId) this.markRead(this.selectedId)
      this.refreshUnread()
    },

    async openWithUser(user) {
      const conv = toConversation(await this.api().open(user.id))
      this.upsertConversation(null, conv)
      await this.select(conv.id)
      return conv
    },

    async markRead(id) {
      if (!isChatPageVisible() || this.selectedId !== id) return
      const list = this.messages[id] ?? []
      const lastPeer = [...list].reverse().find((m) => typeof m.id === 'number' && m.senderId !== this.meId)
      const conv = this.conversations.find((c) => c.id === id)
      if (conv) conv.unreadCount = 0
      // Serverga faqat yangi o'qilgan xabar bo'lsa yuboriladi (lokal unreadCount server hodisasidan kechikishi mumkin).
      if (!lastPeer || lastPeer.id <= (this.readUpTo[id] ?? 0)) return
      this.readUpTo[id] = lastPeer.id
      try {
        await this.api().read(id, lastPeer.id)
      } finally {
        this.refreshUnreadLater()
      }
    },

    // ── Yuborish (optimistik) ────────────────────────────────────────────────
    pushLocal(id, message) {
      ;(this.messages[id] ??= []).push(message)
      const conv = this.conversations.find((c) => c.id === id)
      if (conv) {
        conv.lastMessageRaw = message
        conv.lastMessage = messagePreviewLabel(message)
        conv.lastMessageAt = message.createdAt
      }
    },

    localMessage(base) {
      return {
        id: base.clientId,
        senderId: this.meId,
        reactions: [],
        forwarded: false,
        edited: false,
        status: 'sending',
        createdAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        ...base
      }
    },

    async sendText(text, replyTo) {
      const id = this.selectedId
      if (!id || !text.trim()) return
      const clientId = uuidv4()
      const local = this.localMessage({
        clientId,
        type: 'text',
        text: text.trim(),
        replyTo: replyTo ? this.replySnapshot(replyTo) : null,
        _retry: { kind: 'text', text: text.trim(), replyToId: replyTo?.id }
      })
      this.pushLocal(id, local)
      await this.deliver(id, local)
    },

    sendFiles(files, replyTo) {
      const id = this.selectedId
      if (!id || !files.length) return
      files.forEach((file, i) => {
        const clientId = uuidv4()
        const isImage = file.type.startsWith('image/')
        const local = this.localMessage({
          clientId,
          type: isImage ? 'image' : 'file',
          fileUrl: URL.createObjectURL(file),
          fileName: file.name,
          fileSize: file.size,
          replyTo: i === 0 && replyTo ? this.replySnapshot(replyTo) : null,
          _retry: { kind: 'file', file, replyToId: i === 0 ? replyTo?.id : undefined }
        })
        this.pushLocal(id, local)
        this.deliver(id, local)
      })
    },

    sendVoice(blob, duration, waveform, replyTo) {
      const id = this.selectedId
      if (!id) return
      const clientId = uuidv4()
      const ext = (blob.type.split('/')[1] || 'webm').split(';')[0]
      const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: blob.type || 'audio/webm' })
      const url = URL.createObjectURL(blob)
      const local = this.localMessage({
        clientId,
        type: 'voice',
        fileUrl: url,
        audioUrl: url,
        fileName: file.name,
        fileSize: blob.size,
        duration,
        waveform,
        replyTo: replyTo ? this.replySnapshot(replyTo) : null,
        _retry: { kind: 'voice', file, duration, waveform, replyToId: replyTo?.id }
      })
      this.pushLocal(id, local)
      this.deliver(id, local)
    },

    async deliver(id, local) {
      const r = local._retry
      try {
        let saved
        if (r.kind === 'text') {
          saved = await this.api().sendText(id, { client_id: local.clientId, text: r.text, reply_to_id: r.replyToId })
        } else {
          const [res] = await this.api().sendFiles(id, [r.file], {
            client_ids: [local.clientId],
            reply_to_id: r.replyToId,
            voice: r.kind === 'voice',
            duration: r.duration,
            waveform: r.waveform ? JSON.stringify(r.waveform) : undefined
          })
          saved = res
        }
        this.addMessage(id, toMessage(saved))
      } catch {
        const m = (this.messages[id] ?? []).find((x) => x.clientId === local.clientId && x.status !== 'read')
        if (m && typeof m.id !== 'number') m.status = 'failed'
      }
    },

    async retry(message) {
      const id = this.selectedId
      const m = (this.messages[id] ?? []).find((x) => x.clientId === message.clientId)
      if (!m?._retry) return
      m.status = 'sending'
      await this.deliver(id, m)
    },

    discard(message) {
      const id = this.selectedId
      this.messages[id] = (this.messages[id] ?? []).filter((x) => x.clientId !== message.clientId || typeof x.id === 'number')
    },

    replySnapshot(m) {
      return { id: m.id, senderId: m.senderId, type: m.type, text: m.type === 'text' ? m.text : null, fileName: m.fileName ?? null }
    },

    // ── Amallar ──────────────────────────────────────────────────────────────
    async editMessage(messageId, text) {
      const m = this.selectedMessages.find((x) => x.id === messageId)
      if (!m || !text.trim()) return
      const prev = m.text
      m.text = text.trim()
      m.edited = true
      try {
        const saved = await this.api().edit(messageId, text.trim())
        this.onUpdated({ conversation_id: this.selectedId, message: saved })
      } catch {
        m.text = prev
      }
    },

    async deleteMessage(message) {
      if (typeof message.id !== 'number') return this.discard(message)
      await this.api().remove(message.id)
      this.onDeleted({ conversation_id: this.selectedId, message_id: message.id })
    },

    async forward(message, conversationId) {
      const target = this.conversations.find((c) => c.id === conversationId)
      if (!target?.peerId || typeof message.id !== 'number') return false
      await this.api().forward(message.id, [target.peerId])
      return true
    },

    async react(messageId, emoji) {
      const saved = await this.api().react(messageId, emoji)
      this.onUpdated({ conversation_id: this.selectedId, message: saved })
    },

    async togglePin(id) {
      const conv = this.conversations.find((c) => c.id === id)
      if (!conv) return
      conv.pinned = !conv.pinned
      await this.api().setPinned(id, conv.pinned)
    },

    async clearHistory(id) {
      await this.api().clear(id)
      this.messages[id] = []
      this.hasMore[id] = false
      const conv = this.conversations.find((c) => c.id === id)
      if (conv) Object.assign(conv, { unreadCount: 0, lastMessage: '', lastMessageRaw: null })
      this.refreshUnreadLater()
    },

    async deleteChat(id) {
      await this.api().hide(id)
      this.removeConversation(id)
    },

    async loadMedia(id) {
      const [image, voice, file] = await Promise.all(
        ['image', 'voice', 'file'].map((type) => this.api().media(id, type))
      )
      return { image: image.map(toMessage), voice: voice.map(toMessage), file: file.map(toMessage) }
    },

    async searchUsers(term) {
      const list = await this.api().users(term)
      return list.map(toUser)
    },

    sendTyping() {
      const now = Date.now()
      if (!this.selectedId || now - this.lastTypingSent < TYPING_SEND_MS) return
      this.lastTypingSent = now
      this.api().typing(this.selectedId)
    },

    // ── Server hodisalari ─────────────────────────────────────────────────────
    // O'z xabarim suhbatdosh o'qigan id gacha bo'lsa — ✓✓ (server javobi/yuklash chat:read'dan keyin kelsa ham yo'qolmasin).
    withPeerRead(id, m) {
      if (m.status === 'read' || String(m.senderId) !== String(this.meId) || typeof m.id !== 'number') return m
      const peerLastRead = Number(this.conversations.find((c) => c.id === id)?.peerLastRead ?? 0)
      return peerLastRead && m.id <= peerLastRead ? { ...m, status: 'read' } : m
    },

    // Suhbatdosh shu id gacha o'qidi: ochiq ro'yxatdagi o'z xabarlarimni va suhbat qatorini ✓✓ qiladi.
    applyPeerRead(id, lastReadId) {
      const upTo = Number(lastReadId) || 0
      if (!upTo) return
      ;(this.messages[id] ?? []).forEach((m) => {
        if (String(m.senderId) === String(this.meId) && typeof m.id === 'number' && m.id <= upTo) m.status = 'read'
      })
      const conv = this.conversations.find((c) => c.id === id)
      if (!conv) return
      conv.peerLastRead = Math.max(Number(conv.peerLastRead) || 0, upTo)
      const last = conv.lastMessageRaw
      if (last && String(last.senderId) === String(this.meId) && typeof last.id === 'number' && last.id <= upTo) {
        conv.lastMessageRaw = { ...last, status: 'read' }
      }
    },

    // Lokal (vaqtinchalik) xabar serverda saqlangach — ro'yxatdagi oxirgi xabar ham real id/status oladi.
    syncLastMessage(id, m) {
      const conv = this.conversations.find((c) => c.id === id)
      const last = conv?.lastMessageRaw
      if (!last || !m.clientId || last.clientId !== m.clientId) return
      conv.lastMessageRaw = { ...last, id: m.id, status: m.status }
    },

    addMessage(id, m) {
      const list = (this.messages[id] ??= [])
      m = this.withPeerRead(id, m)
      const byClient = m.clientId ? list.findIndex((x) => x.clientId === m.clientId) : -1
      if (byClient !== -1) {
        const prev = list[byClient]
        // Lokal blob ko'rinishi saqlanadi — server havolasi kelguncha rasm miltillamasin.
        list[byClient] = { ...m, status: prev.status === 'read' ? 'read' : m.status }
        this.syncLastMessage(id, list[byClient])
        return
      }
      if (list.some((x) => x.id === m.id)) return
      list.push(m)
    },

    onMessage({ conversation_id: id, message }) {
      const m = toMessage(message)
      if (this.messages[id]) this.addMessage(id, m)
      delete this.typing[id]
      if (m.senderId === this.meId) return
      if (this.selectedId === id && isChatPageVisible()) {
        this.markRead(id)
        return
      }
      this.refreshUnreadLater()
      this.notifyIncoming(id, m)
    },

    // Yangi suhbat qatori (chat:conversation) xabardan keyin keladi — ism uchun qisqa kutiladi.
    async notifyIncoming(id, m) {
      if (!this.conversations.some((c) => c.id === id)) await new Promise((r) => setTimeout(r, 400))
      const conv = this.conversations.find((c) => c.id === id)
      // Ko'p xabar kelganda: bir suhbatga 5 s da bitta toast, ovoz 2 s da bitta.
      const now = Date.now()
      this._toastAt ??= {}
      if (now - (this._toastAt[id] ?? 0) < TOAST_GAP_MS) return
      this._toastAt[id] = now
      const appStore = useAppStore()
      if (appStore.soundEnabled && now - (this._soundAt ?? 0) > SOUND_GAP_MS) {
        this._soundAt = now
        useNotificationSound().play('notice')
      }
      useNotify().notify(conv?.fullName || t('liveChatPage.newMessage'), 'info', {
        description: messagePreviewLabel(m),
        action: {
          label: t('liveChatPage.open'),
          onClick: async () => {
            const { default: router } = await import('@/router/index.js')
            await router.push(LIVE_CHAT_PATH)
            this.select(id)
          }
        }
      })
    },

    onUpdated({ conversation_id: id, message }) {
      const m = toMessage(message)
      const list = this.messages[id]
      if (!list) return
      const i = list.findIndex((x) => x.id === m.id)
      if (i !== -1) list[i] = { ...m, status: list[i].status === 'read' ? 'read' : m.status }
    },

    onDeleted({ conversation_id: id, message_id }) {
      if (this.messages[id]) this.messages[id] = this.messages[id].filter((x) => x.id !== message_id)
      this.refreshUnreadLater()
    },

    // Suhbatdosh o'qidi — shu id gacha o'z xabarlarim ✓✓.
    onRead({ conversation_id: id, user_id, last_read_message_id }) {
      if (String(user_id) === String(this.meId)) return
      this.applyPeerRead(id, last_read_message_id)
    },

    upsertConversation(raw, ready = null) {
      const conv = ready ?? toConversation(raw)
      const i = this.conversations.findIndex((c) => c.id === conv.id)
      if (this.selectedId === conv.id && isChatPageVisible()) conv.unreadCount = 0
      if (i === -1) this.conversations.push(conv)
      else {
        const prevRead = Number(this.conversations[i].peerLastRead) || 0
        this.conversations[i] = { ...this.conversations[i], ...conv, peerLastRead: Math.max(prevRead, Number(conv.peerLastRead) || 0) }
      }
      this.applyPeerRead(conv.id, conv.peerLastRead)
      this.refreshUnreadLater()
    },

    removeConversation(id) {
      this.conversations = this.conversations.filter((c) => c.id !== id)
      delete this.messages[id]
      if (this.selectedId === id) this.selectedId = null
      this.refreshUnreadLater()
    },

    onTyping({ conversation_id: id, user_id }) {
      if (user_id === this.meId) return
      clearTimeout(this.typing[id])
      this.typing[id] = setTimeout(() => delete this.typing[id], TYPING_SHOW_MS)
    },

    onPresence({ user_id, online, last_seen_at }) {
      this.conversations.forEach((c) => {
        if (c.peerId === user_id) Object.assign(c, { online, lastSeenAt: last_seen_at ?? c.lastSeenAt })
      })
    }
  }
})
