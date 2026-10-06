<script setup>
  import { DocumentPdf24Regular, Dismiss16Regular } from '@vicons/fluent'

  // Tanlangan PDF (`File`) yoki null. Fayl tanlangach dragger o'rnida fayl kartasi
  // turadi — bo'sh "PDF tanlash" maydoni va ostidagi alohida ro'yxat qolmaydi.
  const model = defineModel({ type: File, default: null })

  const onChange = ({ fileList }) => {
    model.value = fileList.at(-1)?.file ?? null
  }

  const formatSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }
</script>

<template>
  <n-upload
    v-if="!model"
    class="w-full"
    accept="application/pdf"
    :max="1"
    :default-upload="false"
    :show-file-list="false"
    @change="onChange"
  >
    <n-upload-dragger>
      <div class="flex flex-col items-center gap-1 py-1">
        <n-icon size="24" class="text-fig-brand">
          <DocumentPdf24Regular />
        </n-icon>
        <span class="text-sm text-fig-text-primary">{{ $t('sickLeave.form.selectPdf') }}</span>
        <span class="text-xs text-fig-text-muted">PDF · 10 MB</span>
      </div>
    </n-upload-dragger>
  </n-upload>

  <div
    v-else
    class="flex w-full items-center gap-3 rounded-lg border border-fig-br-secondary bg-fig-block px-3 py-2.5"
  >
    <span
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-fig-chip-brand text-fig-brand"
    >
      <n-icon size="20"><DocumentPdf24Regular /></n-icon>
    </span>
    <div class="min-w-0 flex-1">
      <div class="truncate text-sm text-fig-text-primary" :title="model.name">
        {{ model.name }}
      </div>
      <div class="text-xs text-fig-text-muted">{{ formatSize(model.size) }}</div>
    </div>
    <n-button
      quaternary
      circle
      size="small"
      :aria-label="$t('content.delete')"
      @click="model = null"
    >
      <template #icon>
        <n-icon><Dismiss16Regular /></n-icon>
      </template>
    </n-button>
  </div>
</template>
