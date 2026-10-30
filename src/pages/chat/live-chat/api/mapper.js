// API (snake_case) → UI shakli (camelCase); mock va real API bir xil javob beradi.
import { messagePreviewLabel } from '../ui/format.js'

// Qo'ng'iroq yozuvi matni — JSON (call_id, call_type, status, end_reason).
const parseCall = (text) => {
  try {
    return JSON.parse(text || '{}')
  } catch {
    return {}
  }
}

export const toMessage = (m) => ({
  id: m.id,
  clientId: m.client_id ?? null,
  conversationId: m.conversation_id,
  senderId: m.sender_id,
  type: m.type,
  text: m.text ?? null,
  fileUrl: m.file_url ?? null,
  audioUrl: m.type === 'voice' ? (m.file_url ?? null) : null,
  fileName: m.file_name ?? null,
  fileSize: m.file_size ?? null,
  // Rasm: asl o'lcham va kichik xira ko'rinish (data URL) — yuklamasdan shakli/xira nusxasi ko'rinadi
  width: m.width ?? null,
  height: m.height ?? null,
  thumb: m.thumb ?? null,
  duration: m.duration ?? null,
  waveform: m.waveform ?? null,
  call: m.type === 'call' ? parseCall(m.text) : null,
  replyTo: m.reply_to
    ? {
        id: m.reply_to.id,
        senderId: m.reply_to.sender_id,
        type: m.reply_to.type,
        text: m.reply_to.text,
        fileName: m.reply_to.file_name
      }
    : null,
  forwarded: !!m.forwarded,
  forwardedFrom: m.forwarded_from ?? null,
  edited: !!m.edited,
  reactions: (m.reactions ?? []).map((r) => ({ emoji: r.emoji, userId: r.user_id })),
  status: m.status ?? 'sent',
  createdAt: m.created_at
})

export const toPeer = (p) => ({
  peerId: p?.id ?? null,
  fullName: p?.full_name ?? '',
  photo: p?.photo ?? null,
  phone: p?.phone ?? null,
  position: p?.position ?? null,
  online: !!p?.online,
  lastSeenAt: p?.last_seen_at ?? null
})

export const toConversation = (c) => {
  const last = c.last_message
    ? {
        id: c.last_message.id,
        senderId: c.last_message.sender_id,
        type: c.last_message.type,
        text: c.last_message.text,
        fileName: c.last_message.file_name,
        status: c.last_message.status
      }
    : null
  return {
    id: c.id,
    ...toPeer(c.peer),
    pinned: !!c.pinned,
    unreadCount: c.unread_count ?? 0,
    peerLastRead: c.peer_last_read_message_id ?? 0,
    lastMessageRaw: last,
    lastMessage: last ? messagePreviewLabel(last) : '',
    lastMessageAt: c.last_message?.created_at ?? c.last_message_at ?? null
  }
}

// Qidiruvdagi xodim (suhbat hali yo'q bo'lishi mumkin).
export const toUser = (u) => ({ id: u.id, ...toPeer(u) })
