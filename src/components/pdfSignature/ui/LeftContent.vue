<script setup>
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import { Add16Filled, MailAttach16Regular } from '@vicons/fluent'
  import Utils from '../../../utils/Utils.js'
  import { useRoute } from 'vue-router'
  import FilePreviewModal from './FilePreviewModal.vue'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import FileContractIcon from '@/assets/icons/fileContractIcon.svg'
  import CloudArrowDownIcon from '@/assets/icons/cloudArrowDownIcon.svg'
  import EyeIcon from '@/assets/icons/eyeIcon.svg'

  const route = useRoute()
  const store = usePdfViewerStore()

  const previewVisible = ref(false)
  const previewFile = ref(null)

  const onOpenAttach = () => {
    store.workerApplications = []
    store.attachFiles = []
    store.attachVisible = true
  }

  const onDownload = (url) => {
    window.open(url, '_blank')
  }

  const onPreview = (item) => {
    previewFile.value = item
    previewVisible.value = true
  }

  watch(
    () => store.document,
    (doc) => {
      if (doc?.files > 0) store._files()
    },
    { immediate: true }
  )

  const showDocumentFiles = computed(() => {
    const allowedPaths = [
      '/hrm/contract',
      '/hrm/command',
      '/hrm/ad-contract',
      '/hrm/application',

      '/docflow/conf-contract',
      '/docflow/conf-command',
      '/docflow/conf-ad-contract',
      '/docflow/conf-application'
    ]
    return allowedPaths.includes(route.path)
  })
</script>

<template>
  <SectionHeader
    full-height
    tight-body
    :title="$t('documentPage.signature.attachedDocuments')"
    class="w-full"
  >
    <div class="flex flex-col gap-4">
      <div v-if="store.fileList.length" class="flex flex-col gap-2">
        <template v-for="(item, idx) in store.fileList" :key="idx">
          <div class="flex items-center gap-2 p-2 -mx-2 rounded-lg hover:bg-surface-ground">
            <div
              class="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              :class="item?.file ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'"
            >
              <n-icon size="16">
                <FileContractIcon v-if="item?.file" />
                <MailAttach16Regular v-else />
              </n-icon>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-medium text-textColor1 truncate">
                {{ item?.file ? item.original_name : item?.worker_application?.number }}
              </div>
              <div class="text-[10px] text-gray-400">{{ Utils.timeOnlyDate(item.created_at) }}</div>
            </div>
            <n-icon
              size="16"
              class="cursor-pointer text-textColor3 hover:text-primary shrink-0"
              @click="onDownload(item?.file || item?.worker_application?.confirmation_file)"
            >
              <CloudArrowDownIcon />
            </n-icon>
            <n-icon
              v-if="item?.file"
              size="16"
              class="cursor-pointer text-textColor3 hover:text-primary shrink-0"
              @click="onPreview(item)"
            >
              <EyeIcon />
            </n-icon>
          </div>
        </template>
      </div>

      <div class="flex flex-col gap-4">
        <n-button v-if="showDocumentFiles" @click="onOpenAttach" type="primary" text>
          <template #icon>
            <n-icon size="16">
              <Add16Filled />
            </n-icon>
          </template>
          {{ $t('documentPage.signature.attachDocument') }}
        </n-button>

        <FilePreviewModal v-model:visible="previewVisible" :file="previewFile" />
      </div>
    </div>
  </SectionHeader>
</template>

<style scoped></style>
