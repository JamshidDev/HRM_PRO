<script setup>
  import QRCode from 'qrcode'
  import { usePdfViewerStore } from '@/store/modules/index.js'
  const store = usePdfViewerStore()

  defineProps({
    container: {
      type: Boolean,
      default: true
    }
  })

  const pagesRef = ref(null)
  const pageRefs = ref([])
  const setPageRef = (el, idx) => {
    if (el) pageRefs.value[idx] = el
  }

  // QR joyi PDF nuqtalarida (store.qrPosition); ekrandagi quti shundan hisoblanadi.
  const QR_DEFAULT_PT = 60
  const QR_MIN_PT = 30
  const QR_MAX_PT = 200
  const qrImage = ref(null)
  const dragBox = ref(null)

  // CSS piksel ↔ viewport: mobil'da canvas max-w-full bilan kichrayishi mumkin.
  const pageGeom = (page) => {
    const el = pageRefs.value[page - 1]
    const canvas = el?.querySelector('canvas')
    const viewport = store.pageViewports?.[page]
    if (!el || !canvas || !viewport) return null
    const ratio = canvas.getBoundingClientRect().width / viewport.width || 1
    return { el, canvas, viewport, ratio }
  }

  const boxFromPosition = (pos) => {
    const g = pos && pageGeom(pos.page)
    if (!g) return null
    const [vx, vy] = g.viewport.convertToViewportPoint(pos.x, pos.y + pos.size)
    return {
      page: pos.page,
      left: vx * g.ratio,
      top: vy * g.ratio,
      size: pos.size * g.viewport.scale * g.ratio
    }
  }

  const positionFromBox = (box) => {
    const g = pageGeom(box.page)
    if (!g) return null
    const [x, yTop] = g.viewport.convertToPdfPoint(box.left / g.ratio, box.top / g.ratio)
    const size = box.size / g.ratio / g.viewport.scale
    return {
      page: box.page,
      x: Math.max(0, +x.toFixed(2)),
      y: Math.max(0, +(yTop - size).toFixed(2)),
      size: +size.toFixed(2)
    }
  }

  const qrBox = computed(() => {
    void store.scale
    void store.renderVersion
    return dragBox.value ?? boxFromPosition(store.qrPosition)
  })

  const boxStyle = computed(() => {
    const b = qrBox.value
    const g = b && pageGeom(b.page)
    if (!b || !g) return null
    const c = g.canvas
    return {
      left: `${c.offsetLeft + b.left}px`,
      top: `${c.offsetTop + b.top}px`,
      width: `${b.size}px`,
      height: `${b.size}px`
    }
  })

  // Boshlang'ich joy: oxirgi sahifaning pastki o'ng qismi.
  const placeDefault = () => {
    const page = store.totalPdfPage
    const g = pageGeom(page)
    if (!g) return
    const w = g.viewport.width
    const h = g.viewport.height
    const size = QR_DEFAULT_PT * g.viewport.scale
    store.qrPosition = positionFromBox({
      page,
      left: (w - size - 60) * g.ratio,
      top: (h - size - 120) * g.ratio,
      size: size * g.ratio
    })
  }

  // Ko'rsatiladigan QR — hujjatning ommaviy sahifasi havolasi (backend bosadigan bilan bir xil).
  const buildQrImage = async () => {
    const uuid = store.document?.document?.uuid
    const model = store.model
    const url = uuid && model ? `${window.location.origin}/public/${model}/${uuid}` : 'HRM'
    qrImage.value = await QRCode.toDataURL(url, { margin: 0, width: 200 })
  }

  watch(
    () => [store.qrEditable, store.renderVersion],
    async ([editable]) => {
      if (!editable) return
      if (!qrImage.value) await buildQrImage()
      await nextTick()
      if (!store.qrPosition) placeDefault()
    }
  )

  // Sudrash: sahifa markaz bo'yicha aniqlanadi, quti shu sahifa canvas'i ichida qoladi.
  let pointerStart = null
  const pageAt = (absTop, size) => {
    const center = absTop + size / 2
    for (let p = 1; p <= store.totalPdfPage; p++) {
      const c = pageGeom(p)?.canvas
      if (c && center < c.offsetTop + c.offsetHeight) return p
    }
    return store.totalPdfPage
  }

  const clampToPage = (page, absLeft, absTop, size) => {
    const g = pageGeom(page)
    const c = g.canvas
    const w = c.getBoundingClientRect().width
    const h = c.getBoundingClientRect().height
    const s = Math.min(size, w, h)
    const left = Math.min(Math.max(0, absLeft - c.offsetLeft), w - s)
    const top = Math.min(Math.max(0, absTop - c.offsetTop), h - s)
    return { page, left, top, size: s }
  }

  const startPointer = (e, mode) => {
    const b = qrBox.value
    const g = b && pageGeom(b.page)
    if (!b || !g) return
    e.preventDefault()
    pointerStart = {
      mode,
      x: e.clientX,
      y: e.clientY,
      absLeft: g.canvas.offsetLeft + b.left,
      absTop: g.canvas.offsetTop + b.top,
      box: { ...b }
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp, { once: true })
  }

  const onPointerMove = (e) => {
    if (!pointerStart) return
    const dx = e.clientX - pointerStart.x
    const dy = e.clientY - pointerStart.y
    const s = pointerStart
    if (s.mode === 'move') {
      const absTop = s.absTop + dy
      const page = pageAt(absTop, s.box.size)
      dragBox.value = clampToPage(page, s.absLeft + dx, absTop, s.box.size)
    } else {
      const g = pageGeom(s.box.page)
      const unit = g.viewport.scale * g.ratio
      const size = Math.min(Math.max(s.box.size + Math.max(dx, dy), QR_MIN_PT * unit), QR_MAX_PT * unit)
      dragBox.value = clampToPage(s.box.page, s.absLeft, s.absTop, size)
    }
  }

  const onPointerUp = () => {
    window.removeEventListener('pointermove', onPointerMove)
    if (dragBox.value) store.qrPosition = positionFromBox(dragBox.value)
    dragBox.value = null
    pointerStart = null
  }

  onBeforeUnmount(() => window.removeEventListener('pointermove', onPointerMove))

  watch(
    () => store.scale,
    async () => {
      for (let pageNumber = 1; pageNumber <= store.totalPdfPage; pageNumber++) {
        await store.renderPdf(pageNumber)
      }
    }
  )

  // Tab almashganda viewer qayta mount bo'ladi — yangi bo'sh canvas'larga yuklangan hujjat qayta chiziladi.
  onMounted(async () => {
    if (!store.pdfDocument || store.pdfDocumentUrl !== store.pdfUrl) return
    await nextTick()
    for (let pageNumber = 1; pageNumber <= store.totalPdfPage; pageNumber++) {
      await store.renderPdf(pageNumber)
    }
  })

  const loadPdf = async () => {
    await store.loadPdf()
  }

  defineExpose({
    loadPdf
  })
</script>

<template>
  <div class="w-full flex">
    <div
      ref="scrollElementRef"
      class="flex flex-col mx-auto overflow-y-auto relative pb-8 max-md:max-w-full"
      :style="{ height: container ? `calc(100vh - 50px)` : '100%' }"
    >
      <div ref="pagesRef" class="relative">
        <div v-for="idx in store.totalPdfPage" :key="idx" :ref="(el) => setPageRef(el, idx - 1)">
          <!-- Mobil'da sahifa ekran kengligiga sig'adi (gorizontal skrolsiz); desktop'da
               Ctrl+g'ildirak zoom ishlashi uchun asl o'lcham saqlanadi. -->
          <canvas
            class="border border-surface-line max-md:max-w-full max-md:h-auto"
            :id="`pdfCanvas${idx}`"
          ></canvas>
        </div>

        <!-- Rahbar QR'i: sudrab joylashtiriladi, burchakdan kattalashtiriladi. -->
        <div
          v-if="store.qrEditable && boxStyle && qrImage"
          class="absolute z-10 cursor-move touch-none select-none rounded-sm bg-white ring-2 ring-primary shadow-md"
          :style="boxStyle"
          :title="$t('documentPage.signature.qrPlacementHint')"
          @pointerdown="(e) => startPointer(e, 'move')"
        >
          <img :src="qrImage" alt="QR" class="w-full h-full pointer-events-none" draggable="false" />
          <span
            class="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white cursor-nwse-resize"
            @pointerdown.stop="(e) => startPointer(e, 'resize')"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>
