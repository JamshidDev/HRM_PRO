<script setup>
  // Hujjat varaqlari — imzolash sahifasidagi kabi to'g'ridan-to'g'ri sahifa fonida, katta, yumaloq burchakli.
  import PdfViewer from '@/components/pdfSignature/PdfViewer.vue'
  import { usePublicStore, usePdfViewerStore } from '@/store/modules/index.js'
  import { DocumentDismiss24Regular } from '@vicons/fluent'

  const store = usePublicStore()
  const pdfViewerStore = usePdfViewerStore()

  // Kattaroq o'lchamda chiziladi (tiniq bo'lsin), ustun kengligiga sig'diriladi.
  // Viewer boshqa joylarda ham ishlatiladi: chiqishda avvalgi o'lcham qaytariladi.
  const PUBLIC_PAGE_SCALE = 1.7
  const prevScale = pdfViewerStore.scale
  // Sahifaning onMounted'idan (PDF yuklashdan) oldin ishlaydi — bola komponent avval o'rnatiladi.
  onMounted(() => {
    pdfViewerStore.scale = PUBLIC_PAGE_SCALE
  })
  onBeforeUnmount(() => {
    pdfViewerStore.scale = prevScale
  })
</script>

<template>
  <div class="doc-content w-full">
    <div
      v-if="pdfViewerStore.loadError"
      class="public-card mx-auto flex w-full flex-col items-center px-6 py-12 text-center"
    >
      <span class="flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
        <n-icon size="28"><DocumentDismiss24Regular /></n-icon>
      </span>
      <h3 class="mt-3 text-base font-semibold text-textColor1">
        {{ $t('signature.docLoadError') }}
      </h3>
      <p class="mt-1 text-sm text-textColor3">{{ $t('signature.docLoadErrorHint') }}</p>
      <n-button class="mt-4" type="primary" secondary @click="pdfViewerStore.loadPdf()">
        {{ $t('content.retry') }}
      </n-button>
    </div>

    <template v-else>
      <!-- Varaqlar chizilguncha — varaq shaklidagi skeleton -->
      <n-skeleton
        v-if="store.loading || !pdfViewerStore.totalPdfPage"
        height="1100px"
        style="border-radius: 0"
      />
      <PdfViewer :container="false" />
    </template>
  </div>
</template>

<style scoped>
  .doc-content :deep(canvas) {
    width: 100%;
    max-width: 100%;
    height: auto;
    margin: 0 auto 20px;
    border: 0 !important;
    border-radius: 0; /* haqiqiy qog'oz varaq kabi — burchaklar to'g'ri, yumaloq emas */
    background: #fff;
    box-shadow:
      0 1px 3px rgb(16 24 40 / 10%),
      0 12px 32px -12px rgb(16 24 40 / 22%);
  }
  /* Har bir varaqning o'z o'rami bor — oxirgisining ostida bo'sh joy qoldirilmaydi */
  .doc-content :deep(.relative > div:last-child > canvas) {
    margin-bottom: 0;
  }
  .doc-content :deep(.overflow-y-auto) {
    padding-bottom: 0;
  }
  .doc-content :deep(.mx-auto) {
    width: 100%;
  }
</style>
