<script setup>
  import { reactive, ref, nextTick, watch } from 'vue'
  import { useLoginNewStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import PublicOffer from '@/assets/icons/PublicOffer.svg'
  import * as pdfjsLib from 'pdfjs-dist'
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.min.js'

  const store = useLoginNewStore()

  // 2 hujjat — Foydalanish shartlari (Terms) + Maxfiylik siyosati (Privacy), bitta
  // scroll qilinadigan ro'yxatda ketma-ket joylashtiriladi (tab emas).
  const docs = [
    { key: 'terms', labelKey: 'offerModal.terms', prefix: 'Terms' },
    { key: 'privacy', labelKey: 'offerModal.privacy', prefix: 'Privacy' }
  ]

  const langSuffix = () => {
    const l = localStorage.getItem(useAppSetting.languageKey) || 'uz'
    return l === 'ru' ? 'RU' : l === 'en' ? 'EN' : 'UZ'
  }
  const urlFor = (key) => {
    const doc = docs.find((d) => d.key === key) ?? docs[0]
    return `/terms/HRM_PRO_${doc.prefix}_${langSuffix()}.pdf`
  }

  // Har bir hujjat uchun mustaqil pdfjs render holati — bitta umumiy viewer o'rniga
  // ikkalasini bir vaqtda, o'z canvaslari bilan bir konteynerda ketma-ket chizamiz.
  const docState = reactive({
    terms: { totalPages: 0, loading: false, loadError: false },
    privacy: { totalPages: 0, loading: false, loadError: false }
  })

  const renderPage = async (pdfDocument, key, pageNumber) => {
    const page = await pdfDocument.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1.2 })
    const canvas = document.querySelector(`#pdfCanvas-${key}-${pageNumber}`)
    if (!canvas) return
    canvas.height = viewport.height
    canvas.width = viewport.width
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
  }

  const loadDoc = async (key) => {
    const state = docState[key]
    state.loading = true
    state.loadError = false
    state.totalPages = 0
    try {
      const pdfDocument = await pdfjsLib.getDocument(urlFor(key)).promise
      state.totalPages = pdfDocument.numPages
      await nextTick()
      for (let pageNumber = 1; pageNumber <= state.totalPages; pageNumber++) {
        await renderPage(pdfDocument, key, pageNumber)
      }
    } catch {
      state.loadError = true
    } finally {
      state.loading = false
    }
  }

  const loadDocs = () => Promise.all(docs.map((d) => loadDoc(d.key)))

  // Ikkala hujjat joylashgan konteyner oxirigacha scroll qilinmaguncha
  // "Roziman va davom etaman" tugmasi disabled turadi.
  const hasReadToEnd = ref(false)
  const bodyRef = ref(null)
  let scrollElement = null
  const SCROLL_BOTTOM_THRESHOLD = 24

  const isScrolledToBottom = (el) =>
    !!el && el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_BOTTOM_THRESHOLD

  const onBodyScroll = (e) => {
    if (isScrolledToBottom(e.target)) {
      hasReadToEnd.value = true
    }
  }

  const detachScrollListener = () => {
    scrollElement?.removeEventListener('scroll', onBodyScroll)
    scrollElement = null
  }

  const attachScrollListener = async () => {
    detachScrollListener()
    await nextTick()
    const el = bodyRef.value
    if (!el) return
    scrollElement = el
    // Hujjatlar scroll qilmasdanoq to'liq ko'rinsa — o'qilgan deb hisoblaymiz.
    if (isScrolledToBottom(el)) {
      hasReadToEnd.value = true
    }
    scrollElement.addEventListener('scroll', onBodyScroll)
  }

  // Modal ochilganda ikkala hujjatni yuklaymiz, o'qilganlik holatini tozalaymiz.
  watch(
    () => store.showOfferModal,
    async (v) => {
      if (!v) {
        detachScrollListener()
        return
      }
      hasReadToEnd.value = false
      await loadDocs()
      await attachScrollListener()
    }
  )
</script>

<template>
  <n-modal
    :show="store.showOfferModal"
    :mask-closable="false"
    :close-on-esc="false"
    :auto-focus="false"
    :trap-focus="false"
  >
    <div class="offer-modal-card bg-surface-section rounded-3xl shadow-2xl overflow-hidden flex flex-col">
      <!-- Header: ikonka + sarlavha + subtitle -->
      <div class="px-4 py-2 bg-surface-ground flex items-center gap-3 border-b border-surface-line">
        <div class="offer-modal-icon shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <PublicOffer class="w-6 h-6 text-primary" />
        </div>
        <div class="min-w-0">
          <h2 class="text-2xl font-bold text-textColor0">
            {{ $t('offerModal.title') }}
          </h2>
          <p class="text-sm text-textColor3 mt-0.5">
            {{ $t('offerModal.desc') }}
          </p>
        </div>
      </div>

      <!-- Hujjatlar (PDF) — scroll-gate shu konteynerda ishlaydi -->
      <div ref="bodyRef" class="offer-modal-body offer-modal-gradient-bg flex-1 min-h-0 overflow-y-auto  ">
        <section v-for="(d, i) in docs" :key="d.key" :class="{ 'mt-8 pt-6 border-t border-surface-line': i > 0 }">
          <!-- <h2 class="text-base font-bold text-textColor0 mb-3">
            {{ $t(d.labelKey) }}
          </h2> -->
          <div v-if="docState[d.key].loadError" class="text-sm text-textColor3 text-center py-10">
            {{ $t('offerModal.loadError') }}
          </div>
          <div v-else class="flex flex-col items-center gap-2">
            <div v-for="idx in docState[d.key].totalPages" :key="idx">
              <canvas class="border border-surface-line " :id="`pdfCanvas-${d.key}-${idx}`"></canvas>
            </div>
            <div v-if="docState[d.key].loading" class="flex items-center justify-center py-10 w-full">
              <n-spin size="small" />
            </div>
          </div>
        </section>
      </div>

      <!-- Footer -->
      <div class="offer-modal-gradient-bg px-6 py-4 border-surface-line flex items-center gap-3">
        <button
          type="button"
          class="offer-modal-btn offer-modal-btn--decline"
          @click="store._declineOffer()"
        >
          {{ $t('offerModal.decline') }}
        </button>
        <button
          type="button"
          class="offer-modal-btn offer-modal-btn--accept"
          :disabled="!hasReadToEnd || store.offerLoading"
          @click="store._acceptOfferAndContinue()"
        >
          <span v-if="store.offerLoading" class="offer-modal-btn__spinner"></span>
          {{ $t('offerModal.accept') }}
        </button>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
  .offer-modal-card {
    width: 94vw;
    max-width: 750px;
    height: 92vh;
    max-height: 64vh;
  }

  /* Figma'dagi gradient — kontent (PDF) qismi va footer paneli foni, tugmalarning
     o'zi emas */
  .offer-modal-gradient-bg {
    background: linear-gradient(180deg, #f9fafb 0%, #f5faff 50%, #eff8ff 100%);
  }

  /* Bitta baza klass + har biri uchun variant — naive-ui n-button ichki
     stillari bilan kurashmasdan, keyinchalik osongina dizayn qilish uchun */
  .offer-modal-btn {
    flex: 1 1 0%;
    height: 40px;
    border-radius: 10px;
    border: 1px solid transparent;
    font-size: 14px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    user-select: none;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease,
      filter 0.15s ease,
      transform 0.05s ease;
  }

  .offer-modal-btn:active {
    transform: scale(0.97);
  }

  .offer-modal-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .offer-modal-btn--decline {
    background-color: transparent;
    color: var(--error-color, #d03050);
    border-color: var(--error-color, #d03050);
  }

  .offer-modal-btn--decline:hover {
    background-color: color-mix(in srgb, var(--error-color, #d03050) 10%, transparent);
  }

  .offer-modal-btn--accept {
    background-color: var(--primary-color, #0177d7);
    color: #ffffff;
    border-color: var(--primary-color, #0177d7);
  }

  .offer-modal-btn--accept:hover:not(:disabled) {
    filter: brightness(1.05);
  }

  .offer-modal-btn__spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #ffffff;
    animation: offer-modal-btn-spin 0.6s linear infinite;
  }

  @keyframes offer-modal-btn-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
