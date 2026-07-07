<script setup>
  import PdfViewer from '@/components/pdfSignature/PdfViewer.vue'
  import { usePublicStore, usePdfViewerStore } from '@/store/modules/index.js'
  const store = usePublicStore()
  const pdfViewerStore = usePdfViewerStore()
</script>

<template>
  <n-spin :show="store.loading" class="min-h-[300px]">
    <PdfViewer :container="false" />
    <template v-if="(!store.existFile || pdfViewerStore.loadError) && !store.loading">
      <h3 class="text-secondary text-xl text-center font-medium mt-10 opacity-60">
        {{ $t('publicPage.invalidDocument') }}
      </h3>
    </template>
  </n-spin>
</template>
