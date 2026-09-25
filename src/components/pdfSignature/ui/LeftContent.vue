<script setup>
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import {
    Add16Regular,
    Add24Regular,
    MailAttach16Regular,
    Dismiss12Filled,
    Eye16Regular,
    ArrowDownload16Regular
  } from '@vicons/fluent'
  import { useRoute } from 'vue-router'
  import { useNotify } from '@/composables/useNotify'
  import i18n from '@/i18n/index.js'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import PdfFileIcon from '@/assets/icons/pdfFileIcon.svg'
  import ImageFileIcon from '@/assets/icons/figImageSquare.svg'
  import FileContractIcon from '@/assets/icons/fileContractIcon.svg'
  import Utils from '@/utils/Utils.js'

  const { t } = i18n.global
  const route = useRoute()
  const store = usePdfViewerStore()
  const notify = useNotify()

  // Biriktirish qoidalari backend bilan bir xil: PDF/PNG/JPG, faylga 10 MB, hujjatga 10 ta.
  const ALLOWED_EXT = ['pdf', 'png', 'jpg', 'jpeg']
  const MAX_FILE_MB = 10
  const MAX_FILES = 10
  const MAX_APPLICATIONS = 10

  const inputRef = ref(null)

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
  // Fayllar — plitkalarda, bog'langan arizalar — alohida ro'yxatda.
  const files = computed(() => store.fileList.filter((v) => v?.file))
  const applications = computed(() =>
    store.fileList.filter((v) => !v?.file && v?.worker_application)
  )
  const fileCount = computed(() => files.value.length)

  // Ariza PDF'i ham buyruq o'rnida ochiladi (AttachmentPreview fayl shaklini kutadi).
  const appPreviewId = (item) => `app-${item.id}`
  const onPreviewApplication = (item) => {
    const wa = item.worker_application
    const id = appPreviewId(item)
    store.previewFile =
      store.previewFile?.id === id
        ? null
        : {
            id,
            file: wa?.confirmation_file,
            original_name: `${t('documentPage.signature.files.application')} №${wa?.number}.pdf`,
            created_at: wa?.created_at
          }
  }
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
      if ([item.id, appPreviewId(item)].includes(store.previewFile?.id)) store.previewFile = null
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

  // Fayl buyruq PDF'i o'rnida ochiladi; qayta bosilsa — yopiladi.
  const onPreview = (item) => {
    store.previewFile = store.previewFile?.id === item.id ? null : item
  }

  // Hujjat ochilganda ro'yxat doim yuklanadi (fayllar ham, bog'langan arizalar ham).
  watch(
    () => store.document,
    (doc) => {
      if (doc) store._files()
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
    <div class="flex flex-col gap-3">
      <div class="text-[11px] font-semibold uppercase tracking-wide text-textColor3">
        {{ $t('documentPage.signature.files.files') }}
      </div>
      <div class="grid grid-cols-5 gap-1.5">
        <!-- Qo'shish: punktir chegarali kvadrat — doim birinchi -->
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
        <!-- Biriktirilgan fayllar -->
        <n-tooltip v-for="item in files" :key="item.id" placement="bottom">
          <template #trigger>
            <!-- Ikonka butun plitkani to'ldiradi, rang — fayl turiga qarab -->
            <div
              class="group relative aspect-square rounded-lg flex items-center justify-center overflow-hidden"
              :class="[
                fileTone(item),
                store.previewFile?.id === item.id && 'ring-2 ring-primary ring-offset-1'
              ]"
            >
              <n-icon size="30"><component :is="fileIcon(item)" /></n-icon>

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
                v-if="canEdit"
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
      </div>

      <!-- Bog'langan arizalar — fayllardan alohida ro'yxat -->
      <div v-if="applications.length || canEdit" class="flex flex-col gap-1.5 pt-1">
        <div class="flex items-center justify-between gap-2">
          <div
            class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-textColor3"
          >
            {{ $t('documentPage.signature.files.applications') }}
            <span
              v-if="applications.length"
              class="rounded-full bg-surface-ground px-1.5 text-[10px] font-medium normal-case tracking-normal tabular-nums text-textColor2"
            >
              {{ applications.length }}
            </span>
          </div>
          <n-button
            v-if="canEdit && applications.length && applications.length < MAX_APPLICATIONS"
            secondary
            round
            type="primary"
            size="tiny"
            class="!px-2.5"
            @click="onOpenAttach"
          >
            <template #icon>
              <n-icon size="14"><Add16Regular /></n-icon>
            </template>
            {{ $t('documentPage.signature.files.attachShort') }}
          </n-button>
        </div>

        <!-- Bo'sh holat -->
        <button
          v-if="!applications.length && canEdit"
          type="button"
          class="flex items-center justify-center gap-2 h-11 rounded-lg border-2 border-dashed border-surface-line text-xs font-medium text-textColor3 transition-colors hover:border-primary hover:text-primary hover:bg-primary/5"
          @click="onOpenAttach"
        >
          <n-icon size="16"><Add16Regular /></n-icon>
          {{ $t('documentPage.signature.files.attachApplication') }}
        </button>

        <div
          v-for="item in applications"
          :key="item.id"
          class="group flex items-center gap-2.5 rounded-lg border px-2.5 py-2 min-h-[52px] cursor-pointer transition-colors"
          :class="
            store.previewFile?.id === appPreviewId(item)
              ? 'border-primary bg-primary/5'
              : 'border-surface-line bg-surface-section hover:bg-surface-ground'
          "
          @click="onPreviewApplication(item)"
        >
          <n-icon size="22" class="shrink-0">
            <PdfFileIcon />
          </n-icon>
          <div class="min-w-0 flex-1">
            <!-- Tepada: raqam — chap chekkada, sana — o'ng chekkada -->
            <div
              class="flex items-center justify-between gap-2 text-[10px] text-textColor3 tabular-nums"
            >
              <span>№{{ item.worker_application?.number }}</span>
              <span>{{ Utils.timeOnlyDate(item.worker_application?.created_at) }}</span>
            </div>
            <!-- Asosiy — hujjat nomi to'liq, qalin -->
            <div class="mt-0.5 text-[11px] font-bold text-textColor1 leading-snug">
              {{ item.worker_application?.type?.name }}
            </div>
          </div>

          <!-- Uzish — hover'da, tasdiqlanmagan hujjatda -->
          <n-popconfirm
            v-if="canEdit"
            :positive-text="$t('content.delete')"
            :negative-text="$t('content.cancel')"
            @positive-click="onDelete(item)"
          >
            <template #trigger>
              <n-button
                quaternary
                circle
                size="tiny"
                type="error"
                class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                :loading="store.fileDeleting === item.id"
                @click.stop
              >
                <template #icon>
                  <n-icon><Dismiss12Filled /></n-icon>
                </template>
              </n-button>
            </template>
            {{
              $t('documentPage.signature.files.unlinkConfirm', {
                number: item.worker_application?.number
              })
            }}
          </n-popconfirm>
        </div>
      </div>

      <input
        ref="inputRef"
        type="file"
        class="hidden"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
        @change="onFilesSelected"
      />
      <div v-if="showDocumentFiles && isApproved" class="text-[11px] text-textColor3 leading-snug">
        {{ $t('documentPage.signature.files.locked') }}
      </div>
    </div>
  </SectionHeader>
</template>
