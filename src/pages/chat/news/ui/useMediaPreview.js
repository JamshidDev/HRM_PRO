import { onBeforeUnmount } from 'vue'

/**
 * Media element'lar ikki xil ko'rinishda keladi:
 *  - serverdan: { id, type, path }
 *  - formada yangi tanlangan: { id, name, file }
 * Quyidagi yordamchilar ikkalasi bilan ham ishlaydi.
 */

export const isImageFile = (item) => {
  if (item.file) return item.file.type.startsWith('image/')
  if (item.type) return item.type === 'image'
  return /\.(png|jpe?g|gif|webp)$/i.test(item.path ?? item.name ?? '')
}

export const isVideoFile = (item) => {
  if (item.file) return item.file.type.startsWith('video/')
  if (item.type) return item.type === 'video'
  return /\.(mp4|mpeg|avi|mov)$/i.test(item.path ?? item.name ?? '')
}

/**
 * Har bir komponent o'z Map'ini oladi va unmount'da faqat o'zi yaratgan
 * object URL'larni bekor qiladi — shu sababli bir xil faylni ko'rsatayotgan
 * ikki komponent bir-birining URL'ini buzmaydi.
 */
export const useObjectUrls = () => {
  const previewUrls = new Map()

  const previewSrc = (item) => {
    if (item.path) return item.path
    if (!previewUrls.has(item.id)) previewUrls.set(item.id, URL.createObjectURL(item.file))
    return previewUrls.get(item.id)
  }

  const revokePreview = (id) => {
    if (previewUrls.has(id)) {
      URL.revokeObjectURL(previewUrls.get(id))
      previewUrls.delete(id)
    }
  }

  onBeforeUnmount(() => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url))
    previewUrls.clear()
  })

  return { previewSrc, revokePreview }
}
