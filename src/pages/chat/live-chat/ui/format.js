import { stripFormatting } from './textFormat.js'

const AVATAR_COLORS = ['#1279f0', '#2dcb73', '#f26b1f', '#b832d6', '#e0417f', '#5550e5']

export const getInitials = (fullName) =>
  (fullName || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

export const getAvatarColor = (id) => AVATAR_COLORS[Number(id) % AVATAR_COLORS.length]

export const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Xabar turi bo'yicha qisqa matnli ko'rinish — sidebar'da oxirgi xabar sifatida
// va javob (reply) tirnoqchasida ishlatiladi.
export const messagePreviewLabel = (message) => {
  if (!message) return ''
  if (message.type === 'text') return stripFormatting(message.text)
  if (message.type === 'image') return '📷 Rasm'
  if (message.type === 'voice') return '🎤 Ovozli xabar'
  return `📎 ${message.fileName || 'Fayl'}`
}

export const formatDuration = (seconds) => {
  const s = Math.max(0, Math.round(seconds || 0))
  const m = Math.floor(s / 60)
  const rest = s % 60
  return `${m}:${String(rest).padStart(2, '0')}`
}

// Matndan barqaror (deterministik) sonli seed — ovozli xabar ID'si uchun.
export const hashString = (str) => {
  let hash = 0
  for (let i = 0; i < (str || '').length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

// Haqiqiy to'lqin shakli (`decodeAudioData`) mavjud bo'lmagan ovozli xabarlar
// uchun (masalan, brauzer dekodlay olmasa) — bir xil ID doim bir xil "to'lqin"
// beradi, shunda UI qayta render'da sakramaydi.
//
// Sof tasodifiy qiymatlar deyarli bir xil balandlikda chiqib, "tekis chiziq"
// taassurotini berardi. Shu sababli ikkita sinusoid ustma-ust qo'yiladi —
// gaplashuv burjlariga o'xshash past-baland-past naqsh hosil qiladi, tasodif
// esa faqat ustiga mayda tebranish qo'shadi.
export const generateWaveform = (seed, count = 40) => {
  let x = Math.abs(Number(seed)) || 1
  const next = () => {
    x = (x * 9301 + 49297) % 233280
    return x / 233280
  }
  const bars = []
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1)
    const envelope = Math.abs(Math.sin(t * Math.PI * 2.4) * Math.sin(t * Math.PI * 0.6 + 0.4))
    const noise = 0.55 + next() * 0.45
    bars.push(Math.min(1, Math.max(0.06, envelope * noise)))
  }
  return bars
}

// Xabar faqat emojidan iborat bo'lsa (1–3 ta) — ularning soni, aks holda 0.
// Telegram'dagi kabi bunday xabarlar pufaksiz, katta o'lchamda chiziladi.
const EMOJI_GRAPHEME = /^(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[#*0-9]\uFE0F?\u20E3)/u
export const bigEmojiCount = (text, max = 3) => {
  const s = (text || '').replace(/\s+/g, '')
  if (!s || typeof Intl === 'undefined' || !Intl.Segmenter) return 0
  const parts = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s)]
  if (parts.length > max) return 0
  return parts.every((p) => EMOJI_GRAPHEME.test(p.segment)) ? parts.length : 0
}

// Rasm yuborilayotganda (Telegram kabi): asl o'lcham + juda kichik (≈20px, <1KB) xira ko'rinish.
// Qabul qiluvchi rasmni yuklamasdan turib uning shaklini va xira nusxasini ko'radi.
const THUMB_SIDE = 20
export const makeImageThumb = async (file) => {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const { width, height } = bitmap
    const scale = THUMB_SIDE / Math.max(width, height)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close?.()
    return { width, height, thumb: canvas.toDataURL('image/jpeg', 0.6) }
  } catch {
    return null
  }
}
