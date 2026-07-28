<script setup>
  import { ref, computed, watch, nextTick } from 'vue'
  import { useLoginNewStore, usePdfViewerStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import { Dismiss24Regular } from '@vicons/fluent'
  import PdfViewer from '@/components/pdfSignature/PdfViewer.vue'

  const store = useLoginNewStore()
  // Buyruqlar view'idagi bir xil PDF reader (pdfjs canvas) — usePdfViewerStore + PdfViewer.vue.
  const pdfStore = usePdfViewerStore()

  // 2 hujjat — Foydalanish shartlari (Terms) + Maxfiylik siyosati (Privacy), tilga moslab.
  const docs = [
    { key: 'terms', labelKey: 'offerModal.terms', prefix: 'Terms' },
    { key: 'privacy', labelKey: 'offerModal.privacy', prefix: 'Privacy' }
  ]
  const activeKey = ref('terms')

  const langSuffix = () => {
    const l = localStorage.getItem(useAppSetting.languageKey) || 'uz'
    return l === 'ru' ? 'RU' : l === 'en' ? 'EN' : 'UZ'
  }
  const urlFor = (key) => {
    const doc = docs.find((d) => d.key === key) ?? docs[0]
    return `/terms/HRM_PRO_${doc.prefix}_${langSuffix()}.pdf`
  }

  const loadActive = async () => {
    pdfStore.pdfUrl = urlFor(activeKey.value)
    await pdfStore.loadPdf()
  }

  // Modal ochilganда birinchi hujjatni (Terms) yuklaymiz.
  watch(
    () => store.showOfferModal,
    async (v) => {
      if (!v) return
      activeKey.value = 'terms'
      await nextTick()
      await loadActive()
    }
  )

  const selectDoc = async (key) => {
    if (key === activeKey.value) return
    activeKey.value = key
    await loadActive()
  }
</script>

<template>
  <n-modal
    :show="store.showOfferModal"
    :mask-closable="false"
    :close-on-esc="false"
    :auto-focus="false"
    :trap-focus="false"
  >
    <div
      class="offer-modal-card bg-surface-section rounded-2xl shadow-2xl overflow-hidden flex flex-col"
    >
      <!-- Header: title + hujjat tablari (Terms/Privacy) + yopish -->
      <div class="px-5 py-3 border-b border-surface-line flex items-center justify-between gap-3 flex-wrap">
        <h2 class="text-sm md:text-base font-semibold text-textColor0 shrink-0">
          {{ $t('offerModal.title') }}
        </h2>
        <div class="flex items-center gap-2">
          <n-button
            v-for="d in docs"
            :key="d.key"
            size="small"
            :type="activeKey === d.key ? 'primary' : 'default'"
            @click="selectDoc(d.key)"
          >
            {{ $t(d.labelKey) }}
          </n-button>
          <n-button quaternary circle size="small" @click="store._declineOffer()">
            <template #icon>
              <n-icon :size="18" :component="Dismiss24Regular" />
            </template>
          </n-button>
        </div>
      </div>

      <!-- PDF reader (buyruqlar view'idagi bilan bir xil) -->
      <div class="offer-viewer flex-1 min-h-0 bg-surface-base relative">
        <div
          v-if="pdfStore.loadError"
          class="w-full h-full flex items-center justify-center text-textColor3 text-sm"
        >
          {{ $t('offerModal.loadError') }}
        </div>
        <PdfViewer v-else ref="viewerRef" :container="false" />
        <div
          v-if="pdfStore.loading"
          class="absolute inset-0 flex items-center justify-center bg-surface-base/60"
        >
          <n-spin size="large" />
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-surface-line flex justify-end gap-3">
        <n-button @click="store._declineOffer()">
          {{ $t('offerModal.decline') }}
        </n-button>
        <n-button
          type="primary"
          :loading="store.offerLoading"
          @click="store._acceptOfferAndContinue()"
        >
          {{ $t('offerModal.accept') }}
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
  /* Kenglik A4 PDF (scale 1.2 ≈ 714px) ga moslangan — juda keng emas */
  .offer-modal-card {
    width: 94vw;
    max-width: 780px;
    height: 92vh;
    max-height: 92vh;
  }
  /* .offer-viewer flex-1 min-h-0 orqali aniq balandlikka ega; ichidagilarni
     absolute bilan to'ldiramiz — PdfViewer'ning balandliksiz o'rta div'i (w-full flex)
     % zanjirini uzganda ham ichki .overflow-y-auto aniq chegara olib scroll qiladi. */
  .offer-viewer {
    position: relative;
    overflow: hidden;
  }
  /* PdfViewer ildizi + overlaylar .offer-viewer'ni to'ldiradi */
  .offer-viewer > :deep(div) {
    position: absolute;
    inset: 0;
  }
  /* Ichki scroll konteyneri — aniq chegara → vertikal scroll ishlaydi */
  .offer-viewer :deep(.overflow-y-auto) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: auto !important;
    overflow-y: auto;
    align-items: center;
  }
</style>
