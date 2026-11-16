// pdf.js yagona ulanishi: legacy build (eski brauzerlar uchun polyfill'lar bilan) va HiDPI chizish.
import { markRaw } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export { pdfjsLib }

// Ekran zichligi (Retina/2x); 3 dan yuqorisi xotirani behuda yeydi.
export const outputScale = () => Math.min(window.devicePixelRatio || 1, 3)

// markRaw — pdf.js private field'lari Vue/Pinia reaktiv Proxy orqali o'qilmaydi.
export const loadPdfDocument = async (url) =>
  markRaw(await pdfjsLib.getDocument({ url, isEvalSupported: false }).promise)

// Sahifani canvas'ga ekran zichligida chizadi; CSS o'lchami viewport bilan bir xil qoladi.
export function renderPageToCanvas(page, canvas, scale) {
  const viewport = page.getViewport({ scale })
  const dpr = outputScale()
  canvas.width = Math.floor(viewport.width * dpr)
  canvas.height = Math.floor(viewport.height * dpr)
  canvas.style.width = `${viewport.width}px`
  const task = page.render({
    canvas,
    canvasContext: canvas.getContext('2d'),
    viewport,
    transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined
  })
  return { viewport, task: markRaw(task), dpr }
}
