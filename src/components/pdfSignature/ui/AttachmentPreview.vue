<script setup>
  import { ArrowLeft20Filled, CloudArrowDown16Regular, ErrorCircle24Filled } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import PdfCanvasViewer from './PdfCanvasViewer.vue'
  import { usePdfViewerStore } from '@/store/modules/index.js'

  const store = usePdfViewerStore()
  // Asosiy hujjat sahifasining kengligi (render qilingan bo'lsa — o'sha, aks holda
  // A4 kengligi joriy masshtabda) — biriktirilgan fayl ham shu o'lchamda ochiladi.
  const A4_WIDTH_PT = 595.28
  const pageWidth = computed(() => Math.round(store.pdfWidth || A4_WIDTH_PT * store.scale))

  // Biriktirilgan faylni buyruq PDF'i o'rnida (markaziy qismda) ko'rsatadi — modal emas.
  const props = defineProps({
    file: { type: Object, default: null }
  })
  const emits = defineEmits(['close'])

  const loading = ref(false)
  const loadError = ref(false)

  const source = computed(() => props.file?.original_name || props.file?.file || '')
  const isPdf = computed(() => /\.pdf($|\?)/i.test(source.value))
  const isImage = computed(() => /\.(png|jpe?g|gif|webp|bmp)($|\?)/i.test(source.value))

  watch(
    () => props.file?.id,
    () => {
      loadError.value = false
      loading.value = isPdf.value
    },
    { immediate: true }
  )

  const onPdfLoaded = () => {
    loading.value = false
  }
  const onPdfError = () => {
    loadError.value = true
    loading.value = false
  }
  const onDownload = () => {
    if (props.file?.file) window.open(props.file.file, '_blank')
  }
</script>

<template>
  <!-- Fon drawer foni bilan bir xil; sarlavha va sahifalar asosiy hujjat kengligida -->
  <div
    class="w-full h-full flex flex-col min-h-0 bg-gradient-to-b from-surface-ground to-surface-section"
  >
    <div class="shrink-0 w-full px-3 pt-0.5 pb-2">
      <div
        class="mx-auto max-w-full flex items-center gap-3 px-2 py-1.5 rounded-xl border border-surface-line bg-surface-section"
        :style="{ width: pageWidth + 'px' }"
      >
        <n-button quaternary size="small" @click="emits('close')">
          <template #icon>
            <n-icon size="16"><ArrowLeft20Filled /></n-icon>
          </template>
          {{ $t('documentPage.signature.files.backToDocument') }}
        </n-button>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold text-textColor1 truncate">{{ file?.original_name }}</div>
          <div v-if="file?.created_at" class="text-[11px] text-textColor3 tabular-nums">
            {{ Utils.timeOnlyDate(file.created_at) }}
          </div>
        </div>
        <n-button tertiary size="small" @click="onDownload">
          <template #icon>
            <n-icon size="16"><CloudArrowDown16Regular /></n-icon>
          </template>
          {{ $t('content.download') }}
        </n-button>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-auto">
      <div
        v-if="loadError"
        class="h-full flex flex-col items-center justify-center text-center py-16 px-8"
      >
        <n-icon size="48" class="text-error mb-4"><ErrorCircle24Filled /></n-icon>
        <h4 class="text-lg font-semibold text-textColor1 mb-2">
          {{ $t('documentPage.signature.fileOpenError') }}
        </h4>
        <p class="text-sm text-gray-400 max-w-[420px] mb-6">
          {{ $t('documentPage.signature.fileOpenErrorDesc') }}
        </p>
        <n-button tertiary @click="onDownload">{{ $t('content.download') }}</n-button>
      </div>
      <n-spin v-else-if="isPdf" :show="loading" class="w-full min-h-full">
        <PdfCanvasViewer
          :url="file?.file"
          :target-width="pageWidth"
          @loaded="onPdfLoaded"
          @error="onPdfError"
        />
      </n-spin>
      <div v-else-if="isImage" class="w-full flex justify-center py-3 px-3">
        <img
          :src="file?.file"
          :alt="file?.original_name"
          class="max-w-full h-auto object-contain border border-surface-line bg-surface-section"
          :style="{ width: pageWidth + 'px' }"
        />
      </div>
    </div>
  </div>
</template>
