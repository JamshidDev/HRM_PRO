<script setup>
  // Imzolanadigan hujjat: sahifalar to'g'ridan-to'g'ri sahifa fonida, katta (ustun kengligida);
  // yuklanayotganda skeleton, yuklab bo'lmasa — sababi va «Qayta urinish».
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import PdfViewer from '@/components/pdfSignature/PdfViewer.vue'
  import { DocumentDismiss24Regular } from '@vicons/fluent'

  const store = usePdfViewerStore()

  // Kattaroq o'lchamda chiziladi (tiniq bo'lsin) — sahifa ustun kengligiga sig'diriladi.
  // Viewer boshqa joylarda ham ishlatiladi: chiqishda avvalgi o'lcham qaytariladi.
  const SIGN_PAGE_SCALE = 1.7
  const prevScale = store.scale

  onMounted(() => {
    store.scale = SIGN_PAGE_SCALE
    store.loadPdf()
  })
  onBeforeUnmount(() => {
    store.scale = prevScale
  })
</script>

<template>
  <div class="doc-content w-full">
    <div
      v-if="store.loadError"
      class="mx-auto my-10 flex max-w-[460px] flex-col items-center px-6 text-center"
    >
      <span class="flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
        <n-icon size="28"><DocumentDismiss24Regular /></n-icon>
      </span>
      <h3 class="mt-3 text-base font-semibold text-textColor1">
        {{ $t('signature.docLoadError') }}
      </h3>
      <p class="mt-1 text-sm text-textColor3">{{ $t('signature.docLoadErrorHint') }}</p>
      <n-button class="mt-4" type="primary" secondary @click="store.loadPdf()">
        {{ $t('content.retry') }}
      </n-button>
    </div>

    <template v-else>
      <!-- Sahifalar chizilguncha — sahifa shaklidagi skeleton -->
      <div v-if="!store.totalPdfPage" class="w-full">
        <n-skeleton height="1100px" style="border-radius: 20px" />
      </div>
      <PdfViewer :container="false" />
    </template>
  </div>
</template>

<style scoped>
  /* Sahifa — varaq: ustun kengligida, yumshoq soya bilan; QR joyi nisbat bilan qayta hisoblanadi. */
  .doc-content :deep(canvas) {
    width: 100%;
    max-width: 100%;
    height: auto;
    margin: 0 auto 20px;
    border: 0 !important;
    border-radius: 20px; /* o'ng paneldagi `.sign-card` bilan bir xil */
    background: #fff;
    box-shadow:
      0 1px 3px rgb(16 24 40 / 10%),
      0 12px 32px -12px rgb(16 24 40 / 22%);
  }
  /* Oxirgi varaq ostida bo'sh joy yo'q — sahifa oxirida varaq va o'ng panel bir chiziqda tugaydi */
  .doc-content :deep(.relative > div:last-child > canvas) {
    margin-bottom: 0;
  }
  .doc-content :deep(.overflow-y-auto) {
    padding-bottom: 0;
  }
  /* PdfViewer ichidagi ustun markazda va kenglikni to'liq oladi */
  .doc-content :deep(.mx-auto) {
    width: 100%;
  }
</style>
