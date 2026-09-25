<script setup>
  import { ArrowLeft20Filled, CloudArrowDown16Regular, ErrorCircle24Filled } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import PdfCanvasViewer from './PdfCanvasViewer.vue'

  // Biriktirilgan faylni buyruq PDF'i o'rnida (markaziy qismda) ko'rsatadi — modal emas.
  const props = defineProps({
    file: { type: Object, default: null }
  })
  const emits = defineEmits(['close'])

  const pageCount = ref(0)
  const loading = ref(false)
  const loadError = ref(false)

  const source = computed(() => props.file?.original_name || props.file?.file || '')
  const isPdf = computed(() => /\.pdf($|\?)/i.test(source.value))
  const isImage = computed(() => /\.(png|jpe?g|gif|webp|bmp)($|\?)/i.test(source.value))

  watch(
    () => props.file?.id,
    () => {
      pageCount.value = 0
      loadError.value = false
      loading.value = isPdf.value
    },
    { immediate: true }
  )

  const onPdfLoaded = (pages) => {
    pageCount.value = pages
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
  <div class="w-full h-full flex flex-col min-h-0 rounded-2xl bg-surface-section overflow-hidden">
    <div class="shrink-0 flex items-center gap-3 px-3 py-2 border-b border-surface-line">
      <n-button quaternary size="small" @click="emits('close')">
        <template #icon>
          <n-icon size="16"><ArrowLeft20Filled /></n-icon>
        </template>
        {{ $t('documentPage.signature.files.backToDocument') }}
      </n-button>
      <div class="min-w-0 flex-1">
        <div class="text-sm font-semibold text-textColor1 truncate">{{ file?.original_name }}</div>
        <div class="text-[11px] text-textColor3 tabular-nums">
          {{ Utils.timeOnlyDate(file?.created_at) }}
          <template v-if="pageCount"> · {{ pageCount }} {{ $t('content.page') }}</template>
        </div>
      </div>
      <n-button tertiary size="small" @click="onDownload">
        <template #icon>
          <n-icon size="16"><CloudArrowDown16Regular /></n-icon>
        </template>
        {{ $t('content.download') }}
      </n-button>
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
        <PdfCanvasViewer :url="file?.file" @loaded="onPdfLoaded" @error="onPdfError" />
      </n-spin>
      <div v-else-if="isImage" class="w-full h-full flex items-center justify-center p-4">
        <img
          :src="file?.file"
          :alt="file?.original_name"
          class="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  </div>
</template>
