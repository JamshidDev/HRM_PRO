// utils/imageCompressor.js

import imageCompression from 'browser-image-compression'

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Backend fayl limiti (bayt) — 4220 KB.
export const MAX_UPLOAD_SIZE = 4220 * 1024

const toJpgName = (name) => `${(name || 'image').replace(/\.[^.]+$/, '')}.jpg`

// multipart FormData uchun: base64 emas, File qaytaradi.
// Rasm bo'lmasa (video va h.k.) fayl o'zgarmaydi.
export async function compressImageFile(file, options = {}) {
  if (!file?.type?.startsWith('image/')) return file
  if (file.size <= 200 * 1024) return file

  try {
    const result = await imageCompression(file, {
      maxSizeMB: options.maxSizeMB ?? 1,
      maxWidthOrHeight: options.maxWidthOrHeight ?? 1920,
      useWebWorker: true,
      maxIteration: 20,
      initialQuality: 0.8,
      fileType: 'image/jpeg'
    })
    if (result.size >= file.size) return file
    return new File([result], toJpgName(file.name), { type: 'image/jpeg', lastModified: file.lastModified })
  } catch (error) {
    console.error('Rasmni siqishda xatolik:', error)
    return file
  }
}

export async function compressImage(file) {
  try {
    if (file.size <= 200 * 1024) {
      return await blobToBase64(file)
    }

    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      maxIteration: 20,
      initialQuality: 0.7,
      fileType: 'image/jpeg'
    }

    let result = await imageCompression(file, options)
    if (result.size > 200 * 1024) {
      await imageCompression(result, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1280,
        maxIteration: 15,
        initialQuality: 0.5,
        fileType: 'image/jpeg'
      })
    }
    return await blobToBase64(result)
  } catch (error) {
    console.error('Rasmni siqishda xatolik:', error)
    throw error
  }
}
