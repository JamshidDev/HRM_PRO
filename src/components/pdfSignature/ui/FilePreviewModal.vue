<script setup>
  import { UIModal } from '@/components/index.js'
  import { ArrowSyncDismiss24Filled, CloudArrowDown16Regular, ErrorCircle24Filled } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import DocxViewer from './DocxViewer.vue'

  const props = defineProps({
    file: {
      type: Object,
      default: null
    }
  })

  const visible = defineModel('visible', { type: Boolean, default: false })

  const docxRef = ref(null)
  const pageCount = ref(0)
  const loading = ref(false)
  const loadError = ref(false)

  const openFile = () => {
    if (!props.file?.file) return
    pageCount.value = 0
    loadError.value = false
    loading.value = true
    nextTick(() => {
      docxRef.value
        ?.openWord(props.file.file)
        .then(() => {
          nextTick(() => {
            pageCount.value = docxRef.value?.$el?.querySelectorAll('.docx').length || 0
            loading.value = false
          })
        })
        .catch(() => {
          loadError.value = true
          loading.value = false
        })
    })
  }

  watch(visible, (v) => {
    if (v) openFile()
  })

  const onDownload = () => {
    if (props.file?.file) window.open(props.file.file, '_blank')
  }
</script>

<template>
  <UIModal :width="740" :height="640" v-model:visible="visible">
    <template #header>
      <div class="flex items-center justify-between px-4 py-2">
        <div class="min-w-0">
          <h3 class="text-lg font-semibold text-textColor1 leading-tight truncate">
            {{ file?.original_name }}
          </h3>
          <div class="text-xs text-gray-400 mt-0.5" :class="[loadError && 'text-error']">
            <template v-if="loadError">{{ $t('documentPage.signature.fileOpenErrorSubtitle') }}</template>
            <template v-else>
              {{ Utils.timeOnlyDate(file?.created_at) }}
              <template v-if="pageCount"> · {{ pageCount }} {{ $t('content.page') }}</template>
            </template>
          </div>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <n-button tertiary size="small" @click="onDownload">
            <template #icon>
              <n-icon size="18">
                <CloudArrowDown16Regular />
              </n-icon>
            </template>
            {{ $t('content.download') }}
          </n-button>
          <n-icon @click="visible = false" class="text-[28px] text-red-500 cursor-pointer">
            <ArrowSyncDismiss24Filled />
          </n-icon>
        </div>
      </div>
    </template>
    <template #default>
      <div v-if="loadError" class="flex flex-col items-center justify-center text-center py-16 px-8">
        <n-icon size="48" class="text-error mb-4">
          <ErrorCircle24Filled />
        </n-icon>
        <h4 class="text-lg font-semibold text-textColor1 mb-2">
          {{ $t('documentPage.signature.fileOpenError') }}
        </h4>
        <p class="text-sm text-gray-400 max-w-[420px] mb-6">
          {{ $t('documentPage.signature.fileOpenErrorDesc') }}
        </p>
        <div class="flex gap-3">
          <n-button type="primary" @click="openFile">
            {{ $t('content.retry') }}
          </n-button>
          <n-button tertiary @click="onDownload">
            {{ $t('content.download') }}
          </n-button>
        </div>
      </div>
      <n-spin v-else :show="loading">
        <DocxViewer ref="docxRef" />
      </n-spin>
    </template>
  </UIModal>
</template>
