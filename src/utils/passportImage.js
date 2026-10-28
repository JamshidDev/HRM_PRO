// Pasportning (ID kartaning) ikki tomoni bitta rasmga birlashtiriladi: old tomoni tepada,
// orqa tomoni pastda. Backend pasport uchun bitta `file` qabul qiladi.

const MAX_WIDTH = 2000

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })

// Orqa tomoni bo'lmasa (yoki old tomoni PDF bo'lsa) fayl o'zgarishsiz qaytadi.
export const mergePassportSides = async (front, back) => {
  if (!front || !back || !front.type?.startsWith('image/')) return front

  const [a, b] = await Promise.all([loadImage(front), loadImage(back)])
  const width = Math.min(MAX_WIDTH, Math.max(a.naturalWidth, b.naturalWidth))
  const heightA = Math.round((a.naturalHeight * width) / a.naturalWidth)
  const heightB = Math.round((b.naturalHeight * width) / b.naturalWidth)
  const gap = Math.round(width * 0.02)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = heightA + gap + heightB
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(a, 0, 0, width, heightA)
  ctx.drawImage(b, 0, heightA + gap, width, heightB)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
  const name = front.name.replace(/\.[^.]+$/, '') + '-ikki-tomoni.jpg'
  return new File([blob], name, { type: 'image/jpeg' })
}
