import { reactive } from 'vue'

// Rasmlarni "bosib yuklash" (Telegram kabi): suhbat pufagi va profil "Rasmlar" tabi shu bitta holatdan
// foydalanadi — biror joyda yuklangan rasm ikkinchisida ham tayyor ko'rinadi, yuklash jarayoni ham umumiy.
// Holat ilova ochiq turgan vaqt davomida saqlanadi (sahifa yangilansa — qaytadan).

// Yuklab olingan rasmlar (xabar id'lari)
export const loadedImages = reactive(new Set())
// id → ko'rsatiladigan manzil (yuklab olingan blob yoki zaxira sifatida asl URL)
const imageSrc = reactive(new Map())
// id → yuklash jarayoni: 0..1, -1 — noma'lum (foiz bilinmaydi). Yo'q bo'lsa — yuklanmayapti.
export const imageProgress = reactive(new Map())
const controllers = new Map()

// O'zim yuborgan yoki qurilmadagi (blob:) rasm — yuklab olish shart emas.
export const isImageLoaded = (message, isOwn = false) =>
  isOwn || loadedImages.has(message?.id) || String(message?.fileUrl || '').startsWith('blob:')

export const imageSrcFor = (message) => imageSrc.get(message?.id) || message?.fileUrl

export const downloadImage = async (message) => {
  const id = message?.id
  if (id == null || loadedImages.has(id) || controllers.has(id)) return
  const ctrl = new AbortController()
  controllers.set(id, ctrl)
  imageProgress.set(id, 0)
  try {
    const res = await fetch(message.fileUrl, { signal: ctrl.signal })
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
    const total = Number(res.headers.get('content-length')) || Number(message.fileSize) || 0
    const reader = res.body.getReader()
    const chunks = []
    let received = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      received += value.length
      imageProgress.set(id, total ? Math.min(0.99, received / total) : -1)
    }
    const type = res.headers.get('content-type') || 'image/jpeg'
    imageSrc.set(id, URL.createObjectURL(new Blob(chunks, { type })))
    loadedImages.add(id)
  } catch {
    if (ctrl.signal.aborted) {
      imageProgress.delete(id)
      return
    }
    // fetch ruxsat etilmasa (masalan CORS) — rasm odatdagidek <img> orqali yuklanadi, foizsiz.
    imageProgress.set(id, -1)
    loadedImages.add(id)
  } finally {
    controllers.delete(id)
  }
}

// ✕ — yuklashni bekor qilish
export const cancelImage = (id) => {
  controllers.get(id)?.abort()
  controllers.delete(id)
  imageProgress.delete(id)
}

// <img> chizib bo'lingach chaqiriladi — progress halqasi yo'qoladi.
export const finishImage = (id) => imageProgress.delete(id)
