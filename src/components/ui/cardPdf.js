import { PDFDocument } from 'pdf-lib'

// Guvohnoma rasmlarini canvasga chizib PDF qilish uchun umumiy yordamchilar

const MM = 72 / 25.4
const PAGE_W = 595.28 // A4
const PAGE_H = 841.89
const PAGE_MARGIN = 15 * MM
const PAGE_GAP = 10 * MM

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Tashqi manbadagi rasm canvasni "tainted" qilmasligi uchun blob orqali yuklanadi
export async function loadSafeImage(src) {
  if (!src) return null
  if (src.startsWith('data:') || src.startsWith('blob:')) return loadImage(src).catch(() => null)
  try {
    const res = await fetch(src, { mode: 'cors' })
    if (!res.ok) throw new Error(res.statusText)
    const url = URL.createObjectURL(await res.blob())
    try {
      return await loadImage(url)
    } finally {
      URL.revokeObjectURL(url)
    }
  } catch {
    return loadImage(src).catch(() => null)
  }
}

export function pct(value, total) {
  return (value / 100) * total
}

export function fitText(ctx, text, maxWidth) {
  const str = (text ?? '').toString()
  if (ctx.measureText(str).width <= maxWidth) return str
  let end = str.length
  while (end > 0 && ctx.measureText(str.slice(0, end) + '…').width > maxWidth) end--
  return str.slice(0, end) + '…'
}

export function drawCover(ctx, img, x, y, w, h) {
  const ratio = Math.max(w / img.width, h / img.height)
  const sw = w / ratio
  const sh = h / ratio
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h)
}

export function drawContain(ctx, img, x, y, w, h) {
  const ratio = Math.min(w / img.width, h / img.height)
  const dw = img.width * ratio
  const dh = img.height * ratio
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

/**
 * Fon rasmi chizilgan, burchaklari yumaloqlangan canvas yaratadi.
 * `ctx` fon rasmining asl piksel o'lchamida ishlaydi (scale ichkarida).
 */
export function createCardCanvas(background, { width, height, radius, scale = 2 }) {
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.beginPath()
  ctx.roundRect(0, 0, width, height, radius)
  ctx.clip()
  drawCover(ctx, background, 0, 0, width, height)
  ctx.textBaseline = 'middle'
  return { canvas, ctx }
}

async function canvasToPng(canvas) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  return new Uint8Array(await blob.arrayBuffer())
}

/**
 * Canvaslarni bitta A4 sahifaga, sahifa kengligi bo'ylab, ustma-ust joylab yuklab beradi.
 */
export async function downloadCanvasesAsPdf(canvases, fileName) {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([PAGE_W, PAGE_H])
  const images = await Promise.all(canvases.map(async (c) => pdf.embedPng(await canvasToPng(c))))

  const width = PAGE_W - PAGE_MARGIN * 2
  const heights = canvases.map((c) => (width * c.height) / c.width)
  const total = heights.reduce((sum, h) => sum + h, 0) + PAGE_GAP * (canvases.length - 1)
  // Hammasi sahifada vertikal markazlanadi
  let top = (PAGE_H + total) / 2
  images.forEach((image, i) => {
    top -= heights[i]
    page.drawImage(image, { x: PAGE_MARGIN, y: top, width, height: heights[i] })
    top -= PAGE_GAP
  })

  const bytes = await pdf.save()
  downloadBlob(new Blob([bytes], { type: 'application/pdf' }), fileName)
}

/**
 * Canvaslarni bitta SVG faylga ustma-ust joylab yuklab beradi (rasmlar PNG sifatida ichiga joylanadi).
 */
export function downloadCanvasesAsSvg(canvases, fileName) {
  const width = Math.max(...canvases.map((c) => c.width))
  const gap = Math.round(width * 0.04)
  let top = 0
  const images = canvases.map((c) => {
    const x = (width - c.width) / 2
    const image = `<image x="${x}" y="${top}" width="${c.width}" height="${c.height}" href="${c.toDataURL('image/png')}"/>`
    top += c.height + gap
    return image
  })
  const height = top - gap
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${images.join('')}</svg>`
  downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), fileName)
}

export function downloadCanvases(canvases, fileName, format = 'pdf') {
  return format === 'svg'
    ? downloadCanvasesAsSvg(canvases, `${fileName}.svg`)
    : downloadCanvasesAsPdf(canvases, `${fileName}.pdf`)
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
