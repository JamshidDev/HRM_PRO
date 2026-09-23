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
  if (message.type === 'text') return message.text
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
