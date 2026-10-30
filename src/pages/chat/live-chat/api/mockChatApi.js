// Soxta live chat serveri — real API bilan bir xil interfeys va javob shakli (backendsiz UI sinovi uchun).
import { v4 as uuidv4 } from 'uuid'

const LATENCY = 250
const wait = (ms = LATENCY) => new Promise((r) => setTimeout(r, ms))
const clone = (v) => JSON.parse(JSON.stringify(v))
const pad = (n) => String(n).padStart(2, '0')
const isoLocal = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
const minutesAgo = (m) => isoLocal(new Date(Date.now() - m * 60000))

// Rasm namunasi — tarmoqsiz SVG.
const placeholderImage = (bg, text) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" font-family="sans-serif" font-size="22" fill="#fff" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`
  )}`

// Ovozli xabar namunasi — jim WAV (davomiyligi bilan, play ishlaydi).
const silentWav = (seconds) => {
  const rate = 8000
  const n = rate * seconds
  const buf = new Uint8Array(44 + n)
  const dv = new DataView(buf.buffer)
  const str = (o, s) => [...s].forEach((c, i) => (buf[o + i] = c.charCodeAt(0)))
  str(0, 'RIFF')
  dv.setUint32(4, 36 + n, true)
  str(8, 'WAVEfmt ')
  dv.setUint32(16, 16, true)
  dv.setUint16(20, 1, true)
  dv.setUint16(22, 1, true)
  dv.setUint32(24, rate, true)
  dv.setUint32(28, rate, true)
  dv.setUint16(32, 1, true)
  dv.setUint16(34, 8, true)
  str(36, 'data')
  dv.setUint32(40, n, true)
  buf.fill(128, 44)
  let bin = ''
  buf.forEach((b) => (bin += String.fromCharCode(b)))
  return `data:audio/wav;base64,${btoa(bin)}`
}

const FIRST = ['Aziz', 'Dilnoza', 'Jasur', 'Malika', 'Bekzod', 'Nilufar', 'Sardor', 'Gulnora', 'Otabek', 'Madina', 'Shoxrux', 'Zarina', 'Rustam', 'Kamola', 'Ulugbek', 'Sevara', 'Javlon', 'Feruza', 'Doniyor', 'Nodira', 'Sherzod', 'Lola', 'Bobur', 'Yulduz', 'Akmal', 'Mohira', 'Farrux', 'Dildora', 'Islom', 'Shahnoza']
const LAST = ['Karimov', 'Yusupova', 'Rashidov', 'Nazarova', 'Tursunov', 'Ergasheva', 'Aliyev', 'Saidova', 'Qodirov', 'Rahimova', 'Toshmatov', 'Xolmatova', 'Abdullayev', 'Mirzayeva', 'Ismoilov', 'Hasanova', 'Jo\'rayev', 'Sobirova', 'Normatov', 'Usmonova', 'Raxmonov', 'Qosimova', 'Ergashev', 'Valiyeva', 'Sultonov', 'Olimova', 'Hamidov', 'Nurmatova', 'Bakirov', 'Ahmedova']
const MIDDLE_M = ['Botirovich', 'Anvarovich', 'Ilhomovich', 'Shavkatovich', 'Rustamovich']
const MIDDLE_F = ['Sherzodovna', 'Farxodovna', 'Davronovna', 'Akmalovna', 'Baxtiyorovna']
const POSITIONS = ['Bosh mutaxassis', 'HR menejer', 'Buxgalter', "Ta'lim bo'limi", 'Turniket operatori', "Kadrlar bo'limi", 'Iqtisodchi', 'Yurist', 'Dispetcher', 'Muhandis']

const REPLIES = ["Xo'p, tushundim.", "Rahmat, hozir ko'rib chiqaman.", 'Albatta, biroz kuting.', "Ha, to'g'ri.", 'Kelishdik 👍', 'Ertaga gaplashamiz.']
const INCOMING = ['Salom, hujjat tayyormi?', 'Bugun yig\'ilish bormi?', 'Iltimos, tabelni tekshirib bering.', "Buyruq imzoga yuborildi.", 'Rahmat!']

export const createMockChatApi = () => {
  let meId = 0
  let seq = 1000
  const listeners = {}
  const users = FIRST.map((first, i) => {
    const female = /a$/.test(LAST[i])
    return {
      id: 900001 + i,
      full_name: `${LAST[i]} ${first} ${(female ? MIDDLE_F : MIDDLE_M)[i % 5]}`,
      photo: null,
      phone: `9${(i * 7919 + 10000000).toString().slice(0, 8)}`,
      position: POSITIONS[i % POSITIONS.length],
      online: i % 3 !== 2,
      last_seen_at: i % 3 === 2 ? minutesAgo(60 * (i + 1)) : null
    }
  })
  const userById = (id) => users.find((u) => u.id === id)

  const conversations = []
  const messages = []
  const reactions = []
  const failedOnce = new Set()

  const emit = (event, data) => (listeners[event] ?? []).forEach((cb) => cb(clone(data)))

  const part = (c, uid) => c.parts.find((p) => p.user_id === uid)
  const peerOf = (c, uid) => c.parts.find((p) => p.user_id !== uid)

  const serializeMessage = (m, viewer) => {
    const r = m.reply_to_id ? messages.find((x) => x.id === m.reply_to_id) : null
    const c = conversations.find((x) => x.id === m.conversation_id)
    const peerRead = c ? (peerOf(c, viewer)?.last_read ?? 0) : 0
    const fwdName = m.forward_from && m.forward_from !== m.sender_id ? (userById(m.forward_from)?.full_name ?? 'Siz') : null
    return {
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      client_id: m.client_id,
      type: m.type,
      text: m.text,
      file_url: m.file_url ?? null,
      file_name: m.file_name ?? null,
      file_size: m.file_size ?? null,
      width: m.width ?? null,
      height: m.height ?? null,
      thumb: m.thumb ?? null,
      duration: m.duration ?? null,
      waveform: m.waveform ?? null,
      reply_to: r ? { id: r.id, sender_id: r.sender_id, type: r.type, text: r.text, file_name: r.file_name ?? null } : null,
      forwarded: !!m.forward_from,
      forwarded_from: fwdName,
      edited: !!m.edited,
      reactions: reactions.filter((x) => x.message_id === m.id).map((x) => ({ emoji: x.emoji, user_id: x.user_id })),
      status: m.sender_id === viewer && peerRead >= m.id ? 'read' : 'sent',
      created_at: m.created_at
    }
  }

  const visible = (c, uid) => {
    const p = part(c, uid)
    return messages.filter((m) => m.conversation_id === c.id && !m.deleted && m.id > p.cleared)
  }

  const serializeConversation = (c, uid) => {
    const p = part(c, uid)
    const peer = peerOf(c, uid)
    const list = visible(c, uid)
    const last = list[list.length - 1]
    const peerUser = peer.user_id === meId ? null : userById(peer.user_id)
    return {
      id: c.id,
      peer: peerUser ? clone(peerUser) : null,
      unread_count: p.unread,
      pinned: !!p.pinned,
      peer_last_read_message_id: peer.last_read,
      last_message_at: last?.created_at ?? null,
      last_message: last
        ? {
            id: last.id,
            sender_id: last.sender_id,
            type: last.type,
            text: last.text,
            file_name: last.file_name ?? null,
            created_at: last.created_at,
            status: last.sender_id === uid && peer.last_read >= last.id ? 'read' : 'sent'
          }
        : null
    }
  }

  const recount = (c, uid) => {
    const p = part(c, uid)
    p.unread = messages.filter(
      (m) => m.conversation_id === c.id && !m.deleted && m.sender_id !== uid && m.id > Math.max(p.last_read, p.cleared)
    ).length
  }

  const pushConversation = (c) => {
    if (part(c, meId)) emit('chat:conversation', { conversation: serializeConversation(c, meId) })
  }

  const openDirect = (userId) => {
    let c = conversations.find((x) => x.parts.some((p) => p.user_id === userId))
    if (!c) {
      c = {
        id: ++seq,
        parts: [
          { user_id: meId, last_read: 0, unread: 0, pinned: false, hidden: false, cleared: 0 },
          { user_id: userId, last_read: 0, unread: 0, pinned: false, hidden: false, cleared: 0 }
        ]
      }
      conversations.push(c)
    }
    return c
  }

  const insert = (c, senderId, data, minutes = 0) => {
    const m = {
      id: ++seq,
      conversation_id: c.id,
      sender_id: senderId,
      client_id: data.client_id ?? uuidv4(),
      created_at: minutes ? minutesAgo(minutes) : isoLocal(new Date()),
      ...data
    }
    messages.push(m)
    c.parts.forEach((p) => {
      p.hidden = false
      if (p.user_id === senderId) p.last_read = m.id
      else p.unread += 1
    })
    return m
  }

  // Suhbatdosh javobi: o'qiydi → yozmoqda → javob yozadi.
  const replying = new Set()
  const simulatePeer = (c) => {
    const peer = peerOf(c, meId)
    const user = userById(peer.user_id)
    if (!user?.online || replying.has(c.id)) return
    replying.add(c.id)
    setTimeout(() => replying.delete(c.id), 3300)
    setTimeout(() => {
      const last = messages.filter((m) => m.conversation_id === c.id).pop()
      peer.last_read = last?.id ?? peer.last_read
      emit('chat:read', { conversation_id: c.id, user_id: peer.user_id, last_read_message_id: peer.last_read })
      pushConversation(c)
    }, 900)
    setTimeout(() => emit('chat:typing', { conversation_id: c.id, user_id: peer.user_id }), 1400)
    setTimeout(() => {
      const m = insert(c, peer.user_id, { type: 'text', text: REPLIES[Math.floor(Math.random() * REPLIES.length)] })
      emit('chat:message', { conversation_id: c.id, client_id: m.client_id, message: serializeMessage(m, meId) })
      pushConversation(c)
    }, 3200)
  }

  const seed = () => {
    const base = [
      [0, [[1, 'Assalomu alaykum! Ertangi yig\'ilish soat nechida?', 180], [0, 'Vaalaykum assalom, soat 10:00 da, 3-qavat majlislar zalida.', 178], [1, 'Rahmat, albatta boraman.', 175]]],
      [1, [[1, "Yangi xodim uchun hujjatlar tayyor bo'ldi.", 50], [0, "Ko'rib chiqaman, rahmat!", 45]]],
      [2, [[1, "Oylik hisobot bo'yicha savolim bor edi.", 600], [0, 'Marhamat, tinglayman.', 590]]],
      [3, [[1, "Kurs sertifikatlari tayyor, qachon yuborsam bo'ladi?", 1400]]],
      [4, [[0, "Kirish qurilmasi ishlamayapti, tekshirib ko'ring.", 20], [1, "Xo'p, hozir boraman.", 18]]]
    ]
    base.forEach(([ui, rows]) => {
      const c = openDirect(users[ui].id)
      rows.forEach(([fromPeer, text, min]) => insert(c, fromPeer ? users[ui].id : meId, { type: 'text', text }, min))
    })
    const c0 = conversations[0]
    insert(c0, users[0].id, { type: 'image', file_url: placeholderImage('#1279f0', "Yig'ilish tartibi"), file_name: "Yig'ilish_tartibi.png", file_size: 245000 }, 60)
    insert(c0, users[0].id, { type: 'voice', file_url: silentWav(4), file_name: 'voice.wav', file_size: 32044, duration: 4 }, 59)
    const c1 = conversations[1]
    insert(c1, users[1].id, { type: 'file', file_url: URL.createObjectURL(new Blob(['Demo hujjat'], { type: 'text/plain' })), file_name: 'Ariza_namunasi.docx', file_size: 58200 }, 44)
    // Uzun tarix — yuqoriga scroll pagination sinovi.
    const long = openDirect(users[5].id)
    for (let i = 130; i >= 1; i--) {
      insert(long, i % 3 ? users[5].id : meId, { type: 'text', text: `Tarixdagi ${131 - i}-xabar` }, i * 37)
    }
    conversations.forEach((c) => {
      const peer = peerOf(c, meId)
      const last = messages.filter((m) => m.conversation_id === c.id).pop()
      // Oxirgi xabar meniki bo'lsa — o'qilgan; aks holda menda 1+ o'qilmagan.
      if (last?.sender_id === meId) peer.last_read = last.id
      const mine = part(c, meId)
      mine.last_read = Math.max(0, (last?.id ?? 0) - (last?.sender_id === meId ? 0 : 1))
      recount(c, meId)
    })
  }

  // Boshqa sahifadagi toast/badge sinovi uchun vaqti-vaqti bilan kiruvchi xabar.
  let incomingTimer = null
  const scheduleIncoming = () => {
    clearTimeout(incomingTimer)
    incomingTimer = setTimeout(() => {
      const u = users[Math.floor(Math.random() * 8)]
      if (u.online) {
        const c = openDirect(u.id)
        const m = insert(c, u.id, { type: 'text', text: INCOMING[Math.floor(Math.random() * INCOMING.length)] })
        emit('chat:message', { conversation_id: c.id, client_id: m.client_id, message: serializeMessage(m, meId) })
        pushConversation(c)
      }
      scheduleIncoming()
    }, 60000 + Math.random() * 60000)
  }

  const conv = (id) => {
    const c = conversations.find((x) => x.id === Number(id))
    if (!c) throw new Error('not_found')
    return c
  }

  return {
    mode: 'mock',
    setMe(id) {
      if (meId) return
      meId = id
      seed()
      scheduleIncoming()
    },
    on(event, cb) {
      ;(listeners[event] ??= []).push(cb)
    },
    off(event, cb) {
      listeners[event] = (listeners[event] ?? []).filter((x) => x !== cb)
    },

    async conversations({ search } = {}) {
      await wait()
      const term = (search || '').trim().toLowerCase()
      const data = conversations
        .filter((c) => {
          const p = part(c, meId)
          return !p.hidden && (visible(c, meId).length || p.pinned || messages.some((m) => m.conversation_id === c.id))
        })
        .map((c) => serializeConversation(c, meId))
        .filter((c) => !term || c.peer?.full_name.toLowerCase().includes(term))
        .sort((a, b) => (b.pinned - a.pinned) || String(b.last_message_at ?? '').localeCompare(String(a.last_message_at ?? '')))
      return { data, total: data.length }
    },
    async quota() {
      return { messages: { limit: 1000, used: 0 }, blocked: false, reset_at: null }
    },
    async unreadCount() {
      await wait(80)
      return { total: conversations.reduce((s, c) => s + (part(c, meId).hidden ? 0 : part(c, meId).unread), 0) }
    },
    async users(search) {
      await wait()
      const term = (search || '').trim().toLowerCase()
      if (term.length < 2) return []
      return clone(users.filter((u) => u.full_name.toLowerCase().includes(term) || u.phone.includes(term)).slice(0, 20))
    },
    async open(userId) {
      await wait()
      const c = openDirect(userId)
      part(c, meId).hidden = false
      return serializeConversation(c, meId)
    },
    async messages(id, { before_id, after_id, limit = 50 } = {}) {
      await wait(before_id ? 600 : LATENCY)
      const c = conv(id)
      let list = visible(c, meId)
      if (after_id !== undefined) list = list.filter((m) => m.id > after_id)
      if (before_id) list = list.filter((m) => m.id < before_id)
      const hasMore = after_id === undefined && list.length > limit
      if (after_id === undefined) list = list.slice(-limit)
      return { data: list.map((m) => serializeMessage(m, meId)), has_more: hasMore }
    },
    async media(id, type) {
      await wait()
      return visible(conv(id), meId)
        .filter((m) => m.type === type)
        .reverse()
        .map((m) => serializeMessage(m, meId))
    },
    async sendText(id, { client_id, text, reply_to_id }) {
      await wait(400)
      // Sinov: '#xato' li xabar birinchi urinishda yiqiladi, qayta yuborishda o'tadi.
      if (text.includes('#xato') && !failedOnce.has(client_id)) {
        failedOnce.add(client_id)
        throw new Error('mock_fail')
      }
      const c = conv(id)
      const dup = messages.find((m) => m.client_id === client_id)
      if (dup) return serializeMessage(dup, meId)
      const m = insert(c, meId, { client_id, type: 'text', text, reply_to_id: reply_to_id ?? null })
      const out = serializeMessage(m, meId)
      emit('chat:message', { conversation_id: c.id, client_id, message: out })
      pushConversation(c)
      simulatePeer(c)
      return out
    },
    async sendFiles(id, files, { client_ids, reply_to_id, voice, duration, waveform, width, height, thumb }) {
      await wait(900)
      const c = conv(id)
      const out = files.map((file, i) => {
        const type = voice ? 'voice' : file.type.startsWith('image/') ? 'image' : 'file'
        const m = insert(c, meId, {
          client_id: client_ids[i],
          type,
          file_url: URL.createObjectURL(file),
          file_name: file.name,
          file_size: file.size,
          duration: voice ? duration : null,
          waveform: voice ? waveform : null,
          width: type === 'image' ? (width ?? null) : null,
          height: type === 'image' ? (height ?? null) : null,
          thumb: type === 'image' ? (thumb ?? null) : null,
          reply_to_id: i === 0 ? (reply_to_id ?? null) : null
        })
        const s = serializeMessage(m, meId)
        emit('chat:message', { conversation_id: c.id, client_id: m.client_id, message: s })
        return s
      })
      pushConversation(c)
      simulatePeer(c)
      return out
    },
    async edit(messageId, text) {
      await wait()
      const m = messages.find((x) => x.id === messageId && x.sender_id === meId)
      if (!m) throw new Error('not_found')
      m.text = text
      m.edited = true
      const s = serializeMessage(m, meId)
      emit('chat:message:updated', { conversation_id: m.conversation_id, message: s })
      pushConversation(conv(m.conversation_id))
      return s
    },
    async remove(messageId) {
      await wait()
      const m = messages.find((x) => x.id === messageId && x.sender_id === meId)
      if (!m) throw new Error('not_found')
      m.deleted = true
      const c = conv(m.conversation_id)
      c.parts.forEach((p) => recount(c, p.user_id))
      emit('chat:message:deleted', { conversation_id: c.id, message_id: messageId })
      pushConversation(c)
    },
    async forward(messageId, userIds) {
      await wait()
      const src = messages.find((x) => x.id === messageId)
      const ids = []
      userIds.forEach((uid) => {
        const c = openDirect(uid)
        const copy = ['type', 'text', 'file_url', 'file_name', 'file_size', 'duration', 'waveform']
        const rest = Object.fromEntries(copy.map((k) => [k, src[k] ?? null]))
        const m = insert(c, meId, { ...rest, forward_from: src.forward_from ?? src.sender_id })
        emit('chat:message', { conversation_id: c.id, client_id: m.client_id, message: serializeMessage(m, meId) })
        pushConversation(c)
        ids.push(c.id)
      })
      return { conversation_ids: ids }
    },
    async react(messageId, emoji) {
      await wait(120)
      const m = messages.find((x) => x.id === messageId)
      const i = reactions.findIndex((x) => x.message_id === messageId && x.user_id === meId)
      if (i !== -1 && reactions[i].emoji === emoji) reactions.splice(i, 1)
      else if (i !== -1) reactions[i].emoji = emoji
      else reactions.push({ message_id: messageId, user_id: meId, emoji })
      const s = serializeMessage(m, meId)
      emit('chat:message:updated', { conversation_id: m.conversation_id, message: s })
      return s
    },
    async read(id, messageId) {
      await wait(80)
      const c = conv(id)
      const p = part(c, meId)
      p.last_read = Math.max(p.last_read, messageId)
      recount(c, meId)
      pushConversation(c)
      return { last_read_message_id: p.last_read }
    },
    async setPinned(id, pinned) {
      await wait(120)
      const c = conv(id)
      part(c, meId).pinned = pinned
      pushConversation(c)
    },
    async clear(id) {
      await wait()
      const c = conv(id)
      const p = part(c, meId)
      const last = messages.filter((m) => m.conversation_id === c.id).pop()
      p.cleared = last?.id ?? 0
      p.last_read = Math.max(p.last_read, p.cleared)
      p.unread = 0
      pushConversation(c)
    },
    async hide(id) {
      await this.clear(id)
      const c = conv(id)
      part(c, meId).hidden = true
      part(c, meId).pinned = false
      emit('chat:conversation:removed', { conversation_id: c.id })
    },
    typing() {}
  }
}
