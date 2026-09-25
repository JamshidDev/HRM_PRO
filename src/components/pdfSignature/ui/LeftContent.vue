<script setup>
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import {
    Add16Regular,
    MailAttach16Regular,
    LinkDismiss16Regular,
    Eye16Regular,
    Delete16Regular
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
    if (!item?.file) return 'bg-fig-chip-amber text-fig-chip-amber-text'
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
      <!-- Fayllar: sarlavha + soni -->
      <div class="flex flex-col gap-1.5">
        <div
          class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-textColor3"
        >
          {{ $t('documentPage.signature.files.files') }}
          <span
            v-if="fileCount"
            class="rounded-full bg-surface-ground px-1.5 text-[10px] font-medium normal-case tracking-normal tabular-nums text-textColor2"
          >
            {{ fileCount }}/{{ MAX_FILES }}
          </span>
        </div>

        <!-- Fayl qatori: turi ikonkasi, nomi va sana; amallar — o'ngda, hover'da -->
        <div
          v-for="item in files"
          :key="item.id"
          class="group flex items-center gap-2.5 rounded-lg border px-2 py-1.5 min-h-[48px] transition-colors"
          :class="
            store.previewFile?.id === item.id
              ? 'border-fig-blue-300 bg-fig-chip-brand'
              : 'border-surface-line bg-surface-section hover:bg-fig-bg-secondary'
          "
        >
          <div
            class="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
            :class="fileTone(item)"
          >
            <n-icon size="20"><component :is="fileIcon(item)" /></n-icon>
          </div>
          <div class="min-w-0 flex-1">
            <n-ellipsis
              :tooltip="{ style: { maxWidth: '260px' } }"
              class="block text-xs font-medium text-textColor1 leading-snug"
            >
              {{ fileName(item) }}
            </n-ellipsis>
            <div class="text-[10px] text-textColor3 tabular-nums uppercase">
              {{ extOf(item.original_name) }}
              <template v-if="item.created_at">
                · {{ Utils.timeOnlyDate(item.created_at) }}
              </template>
            </div>
          </div>

          <!-- Amallar: faol (ochiq) faylda doim, qolganlarida hover'da ko'rinadi -->
          <div
            class="flex items-center gap-0.5 shrink-0 transition-opacity"
            :class="store.previewFile?.id === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
          >
            <n-tooltip>
              <template #trigger>
                <n-button
                  quaternary
                  circle
                  size="small"
                  :type="store.previewFile?.id === item.id ? 'primary' : 'default'"
                  @click="onPreview(item)"
                >
                  <template #icon>
                    <n-icon size="16"><Eye16Regular /></n-icon>
                  </template>
                </n-button>
              </template>
              {{ $t('documentPage.signature.files.view') }}
            </n-tooltip>
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
                  size="small"
                  type="error"
                  :loading="store.fileDeleting === item.id"
                >
                  <template #icon>
                    <n-icon size="16"><Delete16Regular /></n-icon>
                  </template>
                </n-button>
              </template>
              {{ $t('documentPage.signature.files.deleteConfirm', { name: fileName(item) }) }}
            </n-popconfirm>
          </div>
        </div>

        <!-- Fayl qo'shish: punktir chegarali keng tugma + ruxsat etilgan formatlar -->
        <button
          v-if="canAdd"
          type="button"
          class="flex items-center justify-center gap-2 h-11 rounded-lg border-2 border-dashed border-surface-line text-xs font-medium text-textColor3 transition-colors hover:border-primary hover:text-primary hover:bg-fig-chip-brand disabled:cursor-wait"
          :disabled="uploading"
          @click="onPick"
        >
          <n-spin v-if="uploading" :size="14" />
          <n-icon v-else size="16"><Add16Regular /></n-icon>
          <span>{{ $t('documentPage.signature.files.attachFile') }}</span>
          <span class="text-[10px] font-normal opacity-80">
            · {{ $t('documentPage.signature.files.allowedHint', { max: MAX_FILE_MB }) }}
          </span>
        </button>
      </div>

      <!-- Bog'langan arizalar — fayllar bilan bir xil qator uslubida -->
      <div v-if="applications.length || canEdit" class="flex flex-col gap-1.5 pt-1">
        <div class="flex items-center justify-between gap-2 min-h-[24px]">
          <div
            class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-textColor3"
          >
            {{ $t('documentPage.signature.files.applications') }}
            <span
              v-if="applications.length"
              class="rounded-full bg-surface-ground px-1.5 text-[10px] font-medium normal-case tracking-normal tabular-nums text-textColor2"
            >
              {{ applications.length }}/{{ MAX_APPLICATIONS }}
            </span>
          </div>
          <n-tooltip v-if="canEdit && applications.length && applications.length < MAX_APPLICATIONS">
            <template #trigger>
              <n-button quaternary circle size="small" type="primary" @click="onOpenAttach">
                <template #icon>
                  <n-icon size="16"><Add16Regular /></n-icon>
                </template>
              </n-button>
            </template>
            {{ $t('documentPage.signature.files.attachApplication') }}
          </n-tooltip>
        </div>

        <!-- Bo'sh holat -->
        <button
          v-if="!applications.length && canEdit"
          type="button"
          class="flex items-center justify-center gap-2 h-11 rounded-lg border-2 border-dashed border-surface-line text-xs font-medium text-textColor3 transition-colors hover:border-primary hover:text-primary hover:bg-fig-chip-brand"
          @click="onOpenAttach"
        >
          <n-icon size="16"><Add16Regular /></n-icon>
          {{ $t('documentPage.signature.files.attachApplication') }}
        </button>

        <!-- Ariza qatori: ikonka, turi (sarlavha), raqam va sana; amallar — o'ngda, hover'da -->
        <div
          v-for="item in applications"
          :key="item.id"
          class="group flex items-center gap-2.5 rounded-lg border px-2 py-1.5 min-h-[48px] cursor-pointer transition-colors"
          :class="
            store.previewFile?.id === appPreviewId(item)
              ? 'border-fig-blue-300 bg-fig-chip-brand'
              : 'border-surface-line bg-surface-section hover:bg-fig-bg-secondary'
          "
          @click="onPreviewApplication(item)"
        >
          <div
            class="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-fig-chip-amber text-fig-chip-amber-text"
          >
            <n-icon size="18"><MailAttach16Regular /></n-icon>
          </div>
          <div class="min-w-0 flex-1">
            <n-ellipsis
              :line-clamp="2"
              :tooltip="{ style: { maxWidth: '260px' } }"
              class="text-xs font-medium text-textColor1 leading-snug"
            >
              {{ item.worker_application?.type?.name }}
            </n-ellipsis>
            <div class="mt-0.5 text-[11px] font-medium text-textColor2 tabular-nums">
              №{{ item.worker_application?.number }}
              <template v-if="item.worker_application?.created_at">
                · {{ Utils.timeOnlyDate(item.worker_application.created_at) }}
              </template>
            </div>
          </div>

          <div
            class="flex items-center gap-0.5 shrink-0 transition-opacity"
            :class="
              store.previewFile?.id === appPreviewId(item)
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100'
            "
            @click.stop
          >
            <n-tooltip>
              <template #trigger>
                <n-button
                  quaternary
                  circle
                  size="small"
                  :type="store.previewFile?.id === appPreviewId(item) ? 'primary' : 'default'"
                  @click="onPreviewApplication(item)"
                >
                  <template #icon>
                    <n-icon size="16"><Eye16Regular /></n-icon>
                  </template>
                </n-button>
              </template>
              {{ $t('documentPage.signature.files.view') }}
            </n-tooltip>
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
                  size="small"
                  type="error"
                  :loading="store.fileDeleting === item.id"
                >
                  <template #icon>
                    <n-icon size="16"><LinkDismiss16Regular /></n-icon>
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
