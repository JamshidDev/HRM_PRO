<script setup>
  import { NoDataPicture } from '@/components/index.js'
  import { useDocumentArchiveStore } from '@/store/modules/index.js'
  import { CalendarRtl16Regular } from '@vicons/fluent'
  import briefcase from '@/assets/icons/briefcase.svg'
  import downloadIcon from '@/assets/icons/download.svg'
  import folderIcon from '@/assets/icons/folder.svg'
  import Utils from '@/utils/Utils.js'

  const store = useDocumentArchiveStore()

  const downloadFile = (url) => {
    window.open(url, '_blank')
  }

  const fileSize = (bytes) => {
    if (!bytes && bytes !== 0) return null
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
</script>

<template>
  <n-spin :show="store.loading">
    <div class="w-full" v-if="store.list.length > 0">
      <template v-for="(item, idx) in store.list" :key="idx">
        <div
          class="w-full flex flex-col p-4 mb-2 cursor-pointer rounded-xl bg-surface-section hover:shadow-sm transition-all"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-[#D1E9FF]"
              >
                <n-icon size="18" :component="briefcase" />
              </div>
              <p class="font-bold text-base text-textColor0 truncate">{{ item.title }}</p>
            </div>

            <n-button
              class="download-button shrink-0"
              size="small"
              @click="downloadFile(item.file)"
            >
              <template #icon>
                <n-icon :component="downloadIcon" />
              </template>
              {{ $t('content.download') }}
            </n-button>
          </div>

          <div class="flex items-center flex-wrap gap-4 mt-3">
            <div class="flex items-center">
              <n-icon size="18" class="mr-1 text-secondary">
                <CalendarRtl16Regular />
              </n-icon>
              <span class="font-medium">{{ Utils.timeOnlyDate(item.document_date) }}</span>
            </div>

            <div v-if="fileSize(item.file_size)" class="flex items-center">
              <n-icon size="18" class="mr-1" :component="folderIcon" />
              <span class="font-medium">{{ fileSize(item.file_size) }}</span>
            </div>
            <span
              v-else-if="item.type?.name"
              class="text-[#AB7D00] bg-[#FEFAF1] rounded-full px-2 py-0.5 text-xs font-medium"
            >
              {{ item.type?.name }}
            </span>
          </div>

          <p class="text-secondary font-normal! text-sm! mt-1">{{ item?.description }}</p>
        </div>
      </template>
    </div>
    <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
  </n-spin>
</template>

<style scoped>
  .download-button {
    --n-height: 35px !important;
    --n-padding: 4px 16px !important;
    --n-color: #00a652 !important;
    --n-color-hover: #00a652 !important;
    --n-color-pressed: #00954a !important;
    --n-color-focus: #00a652 !important;
    --n-text-color: #fff !important;
    --n-text-color-hover: #fff !important;
    --n-text-color-pressed: #fff !important;
    --n-text-color-focus: #fff !important;
    --n-border: none !important;
    --n-border-hover: none !important;
    --n-border-pressed: none !important;
    --n-border-focus: none !important;
  }
</style>
