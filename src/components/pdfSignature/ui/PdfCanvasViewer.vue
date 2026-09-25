<script setup>
  import * as pdfjsLib from 'pdfjs-dist'
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.min.js'

  const props = defineProps({
    url: {
      type: String,
      default: null
    },
    // Berilsa, har bir sahifa shu kenglikka (px) moslab chiziladi — asosiy hujjat
    // sahifasi bilan bir xil o'lchamda ko'rinishi uchun.
    targetWidth: {
      type: Number,
      default: null
    }
  })

  const emit = defineEmits(['loaded', 'error'])

  const canvasRefs = ref([])
  const totalPages = ref(0)
  let pdfDocument = null

  const setCanvasRef = (el, idx) => {
    if (el) canvasRefs.value[idx] = el
  }

  const renderPage = async (pageNumber) => {
    const page = await pdfDocument.getPage(pageNumber)
    const baseWidth = page.getViewport({ scale: 1 }).width
    const scale = props.targetWidth ? props.targetWidth / baseWidth : 1.2
    const viewport = page.getViewport({ scale })
    const canvas = canvasRefs.value[pageNumber - 1]
    if (!canvas) return
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width
    await page.render({ canvasContext: context, viewport }).promise
  }

  const load = async () => {
    totalPages.value = 0
    canvasRefs.value = []
    if (!props.url) return
    try {
      pdfDocument = await pdfjsLib.getDocument(props.url).promise
      totalPages.value = pdfDocument.numPages
      await nextTick()
      for (let pageNumber = 1; pageNumber <= totalPages.value; pageNumber++) {
        await renderPage(pageNumber)
      }
      emit('loaded', totalPages.value)
    } catch (err) {
      console.error('Error loading PDF:', err)
      emit('error', err)
    }
  }

  watch(() => props.url, load, { immediate: true })
  watch(
    () => props.targetWidth,
    async () => {
      if (!pdfDocument) return
      for (let pageNumber = 1; pageNumber <= totalPages.value; pageNumber++) {
        await renderPage(pageNumber)
      }
    }
  )
</script>

<template>
  <div class="w-full flex flex-col items-center gap-2 pt-0.5 pb-3">
    <canvas
      v-for="idx in totalPages"
      :key="idx"
      :ref="(el) => setCanvasRef(el, idx - 1)"
      class="border border-surface-line max-w-full"
    ></canvas>
  </div>
</template>
