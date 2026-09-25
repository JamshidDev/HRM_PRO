<script setup>
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import {
    Add24Regular,
    MailAttach16Regular,
    Dismiss12Filled,
    Eye16Regular,
    ArrowDownload16Regular,
    Link16Regular
  } from '@vicons/fluent'
  import { useRoute } from 'vue-router'
  import { useNotify } from '@/composables/useNotify'
  import i18n from '@/i18n/index.js'
  import FilePreviewModal from './FilePreviewModal.vue'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import PdfFileIcon from '@/assets/icons/pdfFileIcon.svg'
  import ImageFileIcon from '@/assets/icons/figImageSquare.svg'
  import FileContractIcon from '@/assets/icons/fileContractIcon.svg'

  const { t } = i18n.global
  const route = useRoute()
  const store = usePdfViewerStore()
  const notify = useNotify()

  // Biriktirish qoidalari backend bilan bir xil: PDF/PNG/JPG, faylga 10 MB, hujjatga 10 ta.
  const ALLOWED_EXT = ['pdf', 'png', 'jpg', 'jpeg']
  const MAX_FILE_MB = 10
  const MAX_FILES = 10

  const inputRef = ref(null)
  const previewVisible = ref(false)
  const previewFile = ref(null)

  const extOf = (name) => (name || '').split('.').pop()?.toLowerCase() || ''
  const isImage = (item) => ['png', 'jpg', 'jpeg'].includes(extOf(item?.original_name))
  const fileIcon = (item) => {
    if (!item?.file) return MailAttach16Regular
    if (isImage(item)) return ImageFileIcon
    if (extOf(item.original_name) === 'pdf') return PdfFileIcon
    return FileContractIcon
  }
  const fileTone = (item) => {
    if (!item?.file) return 'bg-warning/10 text-warning'
    if (isImage(item)) return 'bg-fig-chip-indigo text-fig-chip-indigo-text'
    return 'bg-fig-red-50 text-fig-text-red'
  }
  const fileName = (item) => (item?.file ? item.original_name : item?.worker_application?.number)

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

  // Tasdiqlangan hujjatning fayllari muzlatiladi.
  const isApproved = computed(() => store.document?.document?.confirmation?.id === 3)
  const canEdit = computed(() => showDocumentFiles.value && !isApproved.value)
  const fileCount = computed(() => store.fileList.filter((v) => v?.file).length)
  const canAdd = computed(() => canEdit.value && fileCount.value < MAX_FILES)

  const uploading = ref(false)

  const onPick = () => {
    if (!canAdd.value || uploading.value) return
    inputRef.value?.click()
  }

  const onFilesSelected = (e) => {
    const picked = [...(e.target.files || [])]
    e.target.value = ''
    if (!picked.length) return

    const wrongType = picked.find((f) => !ALLOWED_EXT.includes(extOf(f.name)))
    if (wrongType) {
      notify.error(t('documentPage.signature.files.wrongType', { name: wrongType.name }))
      return
    }
    const tooBig = picked.find((f) => f.size > MAX_FILE_MB * 1024 * 1024)
    if (tooBig) {
      notify.error(
        t('documentPage.signature.files.tooBig', { name: tooBig.name, max: MAX_FILE_MB })
      )
      return
    }
    if (fileCount.value + picked.length > MAX_FILES) {
      notify.error(t('documentPage.signature.files.tooMany', { max: MAX_FILES }))
      return
    }

    const formData = new FormData()
    formData.append('document_id', store.document_id)
    formData.append('model', store.model)
    picked.forEach((f) => formData.append('files', f))
    uploading.value = true
    store._attachFile(formData, () => {
      store._files()
      store._refreshMeta()
    })
    // `_attachFile` o'z loading'ini boshqaradi — tugashini kuzatamiz.
    const stop = watch(
      () => store.attachLoading,
      (v) => {
        if (!v) {
          uploading.value = false
          stop()
        }
      }
    )
  }

  const onDelete = (item) => {
    store._deleteFile(item.id, () => {
      store._files()
      store._refreshMeta()
    })
  }

  const onOpenAttach = () => {
    store.workerApplications = []
    store.attachFiles = []
    store.attachVisible = true
  }

  const onDownload = (item) => {
    window.open(item?.file || item?.worker_application?.confirmation_file, '_blank')
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
</script>

<template>
  <SectionHeader
    full-height
    tight-body
    :title="$t('documentPage.signature.attachedDocuments')"
    class="w-full"
  >
    <template v-if="showDocumentFiles" #trailing>
      <span class="text-[11px] tabular-nums text-textColor3">{{ fileCount }}/{{ MAX_FILES }}</span>
    </template>

    <div class="flex flex-col gap-3">
      <div class="grid grid-cols-4 gap-1.5">
        <!-- Biriktirilgan fayllar -->
        <n-tooltip v-for="item in store.fileList" :key="item.id" placement="bottom">
          <template #trigger>
            <div
              class="group relative aspect-square rounded-lg border border-surface-line bg-surface-section flex items-center justify-center overflow-hidden"
            >
              <div
                class="w-7 h-7 rounded-md flex items-center justify-center"
                :class="fileTone(item)"
              >
                <n-icon size="16"><component :is="fileIcon(item)" /></n-icon>
              </div>

              <!-- Amallar — ustiga olib borilganda -->
              <div
                class="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
              >
                <n-button
                  v-if="item?.file"
                  circle
                  size="tiny"
                  secondary
                  class="!bg-white/90"
                  @click="onPreview(item)"
                >
                  <template #icon>
                    <n-icon><Eye16Regular /></n-icon>
                  </template>
                </n-button>
                <n-button
                  circle
                  size="tiny"
                  secondary
                  class="!bg-white/90"
                  @click="onDownload(item)"
                >
                  <template #icon>
                    <n-icon><ArrowDownload16Regular /></n-icon>
                  </template>
                </n-button>
              </div>

              <!-- O'chirish — tasdiqlanmagan hujjatda -->
              <n-popconfirm
                v-if="canEdit && item?.file"
                :positive-text="$t('content.delete')"
                :negative-text="$t('content.cancel')"
                @positive-click="onDelete(item)"
              >
                <template #trigger>
                  <button
                    type="button"
                    class="absolute top-0.5 right-0.5 z-[1] w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    :disabled="store.fileDeleting === item.id"
                    @click.stop
                  >
                    <n-spin v-if="store.fileDeleting === item.id" :size="8" />
                    <n-icon v-else size="8"><Dismiss12Filled /></n-icon>
                  </button>
                </template>
                {{ $t('documentPage.signature.files.deleteConfirm', { name: fileName(item) }) }}
              </n-popconfirm>
            </div>
          </template>
          {{ fileName(item) }}
        </n-tooltip>

        <!-- Qo'shish: punktir chegarali kvadrat -->
        <button
          v-if="canAdd"
          type="button"
          class="aspect-square rounded-lg border-2 border-dashed border-surface-line text-textColor3 flex flex-col items-center justify-center gap-1 transition-colors hover:border-primary hover:text-primary hover:bg-primary/5"
          :disabled="uploading"
          @click="onPick"
        >
          <n-spin v-if="uploading" :size="16" />
          <n-icon v-else size="18"><Add24Regular /></n-icon>
        </button>
      </div>

      <input
        ref="inputRef"
        type="file"
        class="hidden"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
        @change="onFilesSelected"
      />

      <div v-if="canEdit" class="text-[11px] text-textColor3 leading-snug">
        {{ $t('documentPage.signature.files.hint', { max: MAX_FILE_MB, count: MAX_FILES }) }}
      </div>
      <div
        v-else-if="showDocumentFiles && isApproved"
        class="text-[11px] text-textColor3 leading-snug"
      >
        {{ $t('documentPage.signature.files.locked') }}
      </div>

      <!-- Arizani bog'lash (mavjud oqim) -->
      <n-button
        v-if="canEdit"
        text
        type="primary"
        size="small"
        class="self-start"
        @click="onOpenAttach"
      >
        <template #icon>
          <n-icon size="16"><Link16Regular /></n-icon>
        </template>
        {{ $t('documentPage.signature.files.attachApplication') }}
      </n-button>

      <FilePreviewModal v-model:visible="previewVisible" :file="previewFile" />
    </div>
  </SectionHeader>
</template>
