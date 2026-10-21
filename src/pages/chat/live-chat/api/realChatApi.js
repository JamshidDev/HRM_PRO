// Real backend: yozish REST orqali, hodisalar umumiy socket'dan (socketStore) keladi.
import service from '@/service/v1/chat/liveChatService.js'

const EVENTS = [
  'chat:message',
  'chat:message:updated',
  'chat:message:deleted',
  'chat:read',
  'chat:conversation',
  'chat:conversation:removed',
  'chat:typing',
  'chat:presence'
]

export const createRealChatApi = () => {
  const listeners = {}
  let socket = null
  const emit = (event, data) => (listeners[event] ?? []).forEach((cb) => cb(data))
  const forwarders = Object.fromEntries(EVENTS.map((ev) => [ev, (d) => emit(ev, d)]))
  const data = (res) => res.data.data

  return {
    mode: 'real',
    // Socket qayta yaratilsa (token almashdi) — tinglovchilar yangisiga ko'chadi.
    attachSocket(next) {
      if (!next || next === socket) return
      if (socket) EVENTS.forEach((ev) => socket.off(ev, forwarders[ev]))
      socket = next
      EVENTS.forEach((ev) => socket.on(ev, forwarders[ev]))
    },
    on(event, cb) {
      ;(listeners[event] ??= []).push(cb)
    },
    off(event, cb) {
      listeners[event] = (listeners[event] ?? []).filter((x) => x !== cb)
    },

    conversations: async (params = {}) => data(await service._conversations({ per_page: 100, ...params })),
    unreadCount: async () => data(await service._unreadCount()),
    users: async (search) => data(await service._users(search)),
    open: async (userId) => data(await service._open(userId)),
    messages: async (id, params) => data(await service._messages(id, params)),
    media: async (id, type) => data(await service._media(id, type)),
    sendText: async (id, body) => data(await service._sendText(id, body)),
    sendFiles: async (id, files, { client_ids, reply_to_id, voice, duration, waveform, width, height, thumb }) => {
      const form = new FormData()
      files.forEach((f) => form.append('files', f))
      client_ids.forEach((c) => form.append('client_ids', c))
      if (reply_to_id) form.append('reply_to_id', reply_to_id)
      // Rasm: o'lcham + kichik xira ko'rinish (backend saqlab, xabar bilan qaytaradi)
      if (width && height) {
        form.append('width', String(width))
        form.append('height', String(height))
      }
      if (thumb) form.append('thumb', thumb)
      if (voice) {
        form.append('voice', 'true')
        form.append('duration', String(duration ?? 0))
        if (waveform) form.append('waveform', waveform)
      }
      return data(await service._sendFiles(id, form))
    },
    edit: async (messageId, text) => data(await service._edit(messageId, text)),
    remove: async (messageId) => data(await service._remove(messageId)),
    forward: async (messageId, userIds) => data(await service._forward(messageId, userIds)),
    react: async (messageId, emoji) => data(await service._react(messageId, emoji)),
    read: async (id, messageId) => data(await service._read(id, messageId)),
    setPinned: async (id, pinned) => data(await service._pin(id, pinned)),
    clear: async (id) => data(await service._clear(id)),
    hide: async (id) => data(await service._hide(id)),
    typing(id) {
      socket?.emit('chat:typing', { conversation_id: id })
    }
  }
}
