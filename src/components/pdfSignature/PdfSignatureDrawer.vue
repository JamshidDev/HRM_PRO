<script setup>
  import {
    ArrowSyncCircle16Filled,
    ArrowLeft20Filled,
    ClipboardCheckmark20Regular,
    CalendarCancel20Regular,
    Dismiss20Regular
  } from '@vicons/fluent'
  import { UIUser, UILottieReader } from '@/components/index.js'
  import EditRefreshIcon from '@/assets/icons/editRefreshIcon.svg'
  import PdfFileIcon from '@/assets/icons/pdfFileIcon.svg'
  import WordFileIcon from '@/assets/icons/wordFileIcon.svg'
  import FileContractIcon from '@/assets/icons/fileContractIcon.svg'
  import generateFile from '@/assets/json/generateFile.json'
  import {
    usePdfViewerStore,
    useSignatureStore,
    useApplicationStore,
    useAccountStore
  } from '@/store/modules/index.js'
  import { useNotify } from '@/composables/useNotify'
  import i18n from '@/i18n/index.js'
  const { t } = i18n.global
  import ConfirmationList from './ui/ConfirmationList.vue'
  import LeftContent from './ui/LeftContent.vue'
  import DrawerSkeleton from './ui/DrawerSkeleton.vue'
  import ConfirmSignatureModal from './ui/ConfirmSignatureModal.vue'
  import Utils from '../../utils/Utils.js'
  import { useRoute } from 'vue-router'
  import PdfViewer from '@/components/pdfSignature/PdfViewer.vue'
  import ConformAndRejectModal from '@/components/pdfSignature/ui/ConformAndRejectModal.vue'
  import DocumentFileModal from '@/components/pdfSignature/ui/DocumentFileModal.vue'
  const pdfViewerRef = ref(null)

  const route = useRoute()
  const emits = defineEmits([
    'onClose',
    'onEdit',
    'signatureEv',
    'onUpdate',
    'onIntervalUpdate',
    'onCancelInterval'
  ])

  const store = usePdfViewerStore()
  const accountStore = useAccountStore()
  const signatureStore = useSignatureStore()
  const applicationStore = useApplicationStore()
  const notify = useNotify()

  const confirmSignatureVisible = ref(false)
  const signatureInfoVisible = ref(false)
  const resendActionsVisible = ref(false)

  const isSigned = computed(() => store.document?.document?.confirmation?.id === 3)
  const isRejected = computed(() => store.document?.document?.confirmation?.id === 4)
  const rejectReason = computed(() => {
    return (
      store.document?.document?.comment ||
      store.confirmations?.find((v) => v.status?.id === 4)?.comment ||
      null
    )
  })
  const hasDocumentFile = computed(() => !!store.pdfUrl)

  const onOpenConfirmSignature = () => {
    confirmSignatureVisible.value = true
  }

  const onConfirmSignature = () => {
    confirmSignatureVisible.value = false
    onSaveSignature()
  }

  const onSaveSignature = () => {
    signatureStore.confirmationId = store.signatureId
    signatureStore.documentType = store.model
    signatureStore._signatureDocument(
      signatureStore.signatureTypes.contract,
      store.document_id,
      onSuccess
    )
  }

  const onSuccess = () => {
    signatureStore.visible = false
    notify.success(t('documentPage.signature.confirmedNotification'))
    emits('signatureEv')
  }

  const onClose = () => {
    store.visible = false
    emits('onClose')
  }

  const onEdit = () => {
    store.visible = false
    emits('onEdit')
  }

  const showSignature = computed(() => {
    const rejects = [
      '/hrm/contract',
      '/hrm/command',
      '/hrm/ad-contract',
      '/hrm/application',
      '/hrm/structure-report'
    ]
    return !rejects.includes(route.path)
  })

  const showConfirmButtons = computed(() => {
    return route.path === '/hrm/application'
  })

  const showEditButton = computed(() => {
    const rejects = ['/hrm/structure-report']
    return !rejects.includes(route.path)
  })

  const openRejectModal = () => {
    store.documentComment = null
    store.documentVisible = true
  }

  const MIN_LOADING_TIME = 1000

  const getDocument = async (document_id, model) => {
    store.document_id = document_id
    store.model = model
    store._resetForm()
    resendActionsVisible.value = false

    store.visible = true
    store.loading = true
    store.viewerLoading = false
    const startedAt = Date.now()
    let shouldLoadPdf = false
    $ApiService.documentService
      ._openDocument({ params: { model, document_id } })
      .then((res) => {
        const v = res.data.data
        const key = v.document.generate
        store.confirmations = v.confirmations
        store.document = v
        store.document.document.file_name = Utils.fileNameFromUrl(v.document?.doc_url)
        store.pdfUrl = v.document.url
        store.docxUrl = v.document?.doc_url
        const accountRoleName = accountStore?.account?.role?.name
        const accountOrgId = accountStore?.account?.organization?.id
        const documentOrgId = v.document.organization_id

        store.permissions.canEdit =
          v.document.confirmation.id !== 3 &&
          (accountRoleName === 'Admin' || accountOrgId === documentOrgId)
        store.permissions.canSignature = v.signature.signature

        const worker = v.signature?.current_user?.worker
        store.signatureMan = {
          photo: worker?.photo,
          lastName: worker?.last_name,
          firstName: worker?.first_name,
          middleName: worker?.middle_name,
          position: v.signature?.current_user?.position
        }
        store.permissions.qrcode = false

        if ([1, 4].includes(key)) {
          store.permissions.canSignature = false
          autoClose()
        } else if (key === 2 || !store.pdfUrl) {
          store.viewerLoading = true
          store.permissions.canSignature = false
          store.permissions.canEdit = false
        } else {
          shouldLoadPdf = true
        }
      })
      .catch(() => {
        autoClose()
      })
      .finally(() => {
        const finish = () => {
          store.loading = false
          if (shouldLoadPdf) {
            nextTick(() => store.loadPdf())
          }
        }
        const remaining = MIN_LOADING_TIME - (Date.now() - startedAt)
        if (remaining > 0) {
          setTimeout(finish, remaining)
        } else {
          finish()
        }
      })
  }

  const autoClose = () => {
    setTimeout(() => {
      store.visible = false
    }, 200)
  }

  const onRefresh = () => {
    if (!store.document_id) return
    getDocument(store.document_id, store.model)
  }

  // const clearInterval = () => {
  //   emits('onCancelInterval')
  // }

  const onWheelEv = async (event) => {
    if (!store.isCtrlPressed) return
    event.preventDefault()
    const delta = event.deltaY
    const step = 0.1
    if (delta < 0) {
      store.scale = Math.min(3, store.scale + step)
    } else if (delta > 0) {
      store.scale = Math.max(1.2, store.scale - step)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Control') {
      store.isCtrlPressed = true
    }
  }

  const handleKeyUp = (event) => {
    if (event.key === 'Control') {
      store.isCtrlPressed = false
    }
  }

  const openConfirmModal = (v) => {
    store.appButtonType = v
    store.applicationComment = null
    store.applicationVisible = !v

    if (!v) return

    const data = {
      status: v,
      comment: null
    }
    const id = store.document_id
    applicationStore._accept(data, id)
  }

  defineExpose({
    getDocument
  })

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })
</script>

<template>
  <div>
    <n-drawer
      :close-on-esc="false"
      class="ui__onlyOffice-drawer"
      height="100vh"
      v-model:show="store.visible"
      placement="bottom"
    >
      <n-drawer-content class="h-screen">
        <div
          class="w-full h-screen overflow-hidden flex flex-col relative gap-3 p-3 bg-gradient-to-b from-surface-ground to-surface-section"
        >
          <div
            class="w-full h-[60px] shrink-0 rounded-2xl border border-surface-line flex items-center justify-between px-4 bg-surface-section"
          >
            <div class="flex items-center gap-x-3">
              <n-button
                @click="onClose()"
                quaternary
                circle
                size="large"
                class="bg-surface-ground!"
              >
                <template #icon>
                  <n-icon size="20">
                    <ArrowLeft20Filled />
                  </n-icon>
                </template>
              </n-button>
              <div v-if="store.loading" class="hidden md:flex flex-col gap-1.5">
                <n-skeleton width="220px" height="16px" :sharp="false" class="rounded-md" />
                <n-skeleton width="80px" height="11px" :sharp="false" class="rounded-md" />
              </div>
              <div v-else class="hidden md:inline-block">
                <div class="text-lg font-semibold text-textColor1 leading-tight">
                  {{ store.document?.document?.file_name }}
                </div>
                <div class="text-xs text-gray-400">
                  {{ Utils.timeOnlyDate(store?.document?.document?.created) }}
                </div>
              </div>
            </div>
            <div></div>
            <div v-if="store.loading" class="flex gap-3">
              <n-skeleton width="110px" height="34px" :sharp="false" class="rounded-md" />
              <n-skeleton width="110px" height="34px" :sharp="false" class="rounded-md" />
              <n-skeleton width="110px" height="34px" :sharp="false" class="rounded-md" />
            </div>
            <div v-else class="flex gap-3">
              <n-button v-if="store.permissions.canEdit && showEditButton" @click="onEdit" tertiary>
                {{ $t('content.edit') }}
                <template #icon>
                  <n-icon size="16">
                    <EditRefreshIcon />
                  </n-icon>
                </template>
              </n-button>
              <n-button
                v-if="!showSignature && store?.pdfUrl && !store.viewerLoading"
                tag="a"
                target="_blank"
                :href="store.pdfUrl"
                download
                type="error"
              >
                <div class="flex items-center gap-2">
                  <n-icon size="16">
                    <PdfFileIcon />
                  </n-icon>
                  <span>{{ $t('documentPage.signature.downloadPdf') }}</span>
                </div>
              </n-button>
              <n-button
                v-if="!showSignature && store?.docxUrl && !store.viewerLoading"
                tag="a"
                target="_blank"
                :href="store?.docxUrl"
                download
                type="info"
              >
                <div class="flex items-center gap-2">
                  <n-icon size="16">
                    <WordFileIcon />
                  </n-icon>
                  <span>{{ $t('documentPage.signature.downloadWord') }}</span>
                </div>
              </n-button>
            </div>
          </div>

          <DrawerSkeleton v-if="store.loading" />
          <div v-else class="w-full flex-1 min-h-0 flex gap-3">
            <div class="hidden md:flex flex-col w-[300px] h-full gap-3 relative">
              <div class="w-full flex-1 min-h-0">
                <LeftContent />
              </div>
              <div
                v-if="store.permissions?.qrcode"
                class="shrink-0 bg-gray-300 rounded-xl border border-gray-400 h-[100px]"
              ></div>
            </div>

            <div class="flex-1 min-w-0 h-full flex flex-col">
              <div class="h-full flex flex-col">
                <div
                  v-if="showConfirmButtons"
                  class="w-full shrink-0 rounded-2xl bg-surface-section px-4 py-3 flex items-center justify-between gap-4 mb-3"
                >
                  <div class="min-w-0">
                    <div class="font-semibold text-textColor1 truncate">
                      {{ $t('documentPage.signature.confirmDocument') }}
                    </div>
                    <div class="text-xs text-gray-400">
                      {{ Utils.timeOnlyDate(store.document?.document?.created) }}
                    </div>
                  </div>
                  <div class="flex gap-2 shrink-0">
                    <n-button
                      type="error"
                      :loading="applicationStore.modalLoading"
                      :disabled="applicationStore.acceptLoading || applicationStore.modalLoading"
                      @click="openConfirmModal(false)"
                    >
                      {{ $t('content.rejectByMistake') }}
                      <template #icon>
                        <n-icon size="18">
                          <CalendarCancel20Regular />
                        </n-icon>
                      </template>
                    </n-button>
                    <n-button
                      type="primary"
                      :loading="applicationStore.acceptLoading"
                      :disabled="applicationStore.modalLoading || applicationStore.acceptLoading"
                      @click="openConfirmModal(true)"
                    >
                      {{ $t('content.sendToSign') }}
                      <template #icon>
                        <n-icon size="18">
                          <ClipboardCheckmark20Regular />
                        </n-icon>
                      </template>
                    </n-button>
                  </div>
                </div>

                <div
                  v-else-if="
                    store.permissions?.canSignature && showSignature && !isSigned && !isRejected
                  "
                  class="w-full shrink-0 rounded-2xl bg-surface-section px-4 py-3 flex items-center justify-between gap-4 mb-3"
                >
                  <div class="min-w-0">
                    <div class="font-semibold text-textColor1 truncate">
                      {{ $t('documentPage.signature.confirmDocument') }}
                    </div>
                    <div class="text-xs text-gray-400">
                      {{ Utils.timeOnlyDate(store.document?.document?.created) }}
                    </div>
                  </div>
                  <div class="flex gap-2 shrink-0">
                    <n-button type="error" ghost @click="openRejectModal">
                      {{ $t('content.cancel') }}
                    </n-button>
                    <n-button type="success" @click="onOpenConfirmSignature">
                      {{ $t('content.confirm') }}
                    </n-button>
                  </div>
                </div>

                <div
                  v-else-if="isSigned && showSignature"
                  class="w-full shrink-0 rounded-2xl bg-surface-section px-4 py-3 flex items-center justify-between gap-4 mb-3"
                >
                  <div class="min-w-0">
                    <div class="font-semibold text-textColor1 truncate">
                      {{ $t('documentPage.signature.confirmed') }}
                    </div>
                    <div class="text-xs text-gray-400 truncate">
                      {{ Utils.timeOnlyDate(store.document?.document?.created) }} ·
                      {{ $t('documentPage.signature.confirmedWithSignature') }}
                      <template v-if="store.signatureMan?.lastName">
                        · {{ store.signatureMan.lastName }}
                        {{ store.signatureMan.firstName?.[0] }}.{{
                          store.signatureMan.middleName?.[0]
                        }}.
                      </template>
                    </div>
                  </div>
                  <n-popover
                    trigger="click"
                    placement="bottom-end"
                    v-model:show="signatureInfoVisible"
                  >
                    <template #trigger>
                      <n-button tertiary class="shrink-0">
                        {{ $t('documentPage.signature.signatureInfo') }}
                      </n-button>
                    </template>
                    <div class="w-[240px]">
                      <UIUser :short="false" :data="store.signatureMan" />
                    </div>
                  </n-popover>
                </div>

                <div
                  v-else-if="isRejected && showSignature"
                  class="w-full shrink-0 rounded-2xl bg-surface-section px-4 py-3 flex items-center justify-between gap-4 mb-3"
                >
                  <div class="min-w-0">
                    <div class="font-semibold text-textColor1 truncate">
                      {{ $t('documentPage.signature.rejected') }}
                    </div>
                    <div class="text-xs text-gray-400">
                      {{ Utils.timeOnlyDate(store.document?.document?.created) }}
                      <template v-if="rejectReason">
                        · {{ $t('documentPage.signature.rejectedReason') }}: {{ rejectReason }}
                      </template>
                    </div>
                  </div>
                  <n-button
                    v-if="!resendActionsVisible"
                    type="success"
                    class="shrink-0"
                    @click="resendActionsVisible = true"
                  >
                    {{ $t('documentPage.signature.resend') }}
                  </n-button>
                  <div v-else class="flex items-center gap-2 shrink-0">
                    <n-button quaternary circle size="small" @click="resendActionsVisible = false">
                      <template #icon>
                        <n-icon size="16">
                          <Dismiss20Regular />
                        </n-icon>
                      </template>
                    </n-button>
                    <n-button type="error" ghost @click="openRejectModal">
                      {{ $t('content.cancel') }}
                    </n-button>
                    <n-button type="success" @click="onOpenConfirmSignature">
                      {{ $t('content.confirm') }}
                    </n-button>
                  </div>
                </div>

                <div @wheel="onWheelEv" class="flex-1 min-h-0 overflow-auto">
                  <template v-if="store.viewerLoading">
                    <div class="w-full flex justify-center items-center">
                      <div>
                        <UILottieReader
                          style="height: calc(100vh - 160px)"
                          :file-url="generateFile"
                          :auto-run="true"
                        />
                        <h2 class="text-2xl text-center text-gray-400 font-medium animate-bounce">
                          {{ $t('content.preparingDocument') }}
                        </h2>
                        <div class="w-full flex justify-center">
                          <n-button size="medium" round @click="() => emits('onUpdate')">
                            <template #icon>
                              <n-icon size="32" class="text-dark">
                                <ArrowSyncCircle16Filled />
                              </n-icon>
                            </template>
                            {{ $t('documentPage.signature.checkDocument') }}
                          </n-button>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="!hasDocumentFile || store.loadError">
                    <div
                      class="w-full h-full flex flex-col items-center justify-center text-center px-8"
                    >
                      <div
                        class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
                      >
                        <n-icon size="26" class="text-primary">
                          <FileContractIcon />
                        </n-icon>
                      </div>
                      <h3 class="text-lg font-semibold text-textColor1 mb-2">
                        {{
                          store.loadError
                            ? $t('documentPage.signature.loadErrorTitle')
                            : $t('documentPage.signature.emptyFilesTitle')
                        }}
                      </h3>
                      <p class="text-sm text-gray-400 max-w-[360px] mb-3 text-pretty">
                        {{
                          store.loadError
                            ? $t('documentPage.signature.loadErrorDesc')
                            : $t('documentPage.signature.emptyFilesDesc')
                        }}
                      </p>
                      <n-button v-if="store.loadError" @click="onRefresh" tertiary size="small">
                        <template #icon>
                          <n-icon size="16">
                            <ArrowSyncCircle16Filled />
                          </n-icon>
                        </template>
                        {{ $t('content.refresh') }}
                      </n-button>
                      <span
                        v-else-if="store.permissions?.canSignature && showSignature"
                        @click="
                          () => {
                            store.workerApplications = []
                            store.attachFiles = []
                            store.attachVisible = true
                          }
                        "
                        class="text-primary text-sm font-medium cursor-pointer"
                      >
                        + {{ $t('documentPage.signature.attachDocument') }}
                      </span>
                    </div>
                  </template>
                  <template v-else>
                    <PdfViewer ref="pdfViewerRef" :container="false" />
                  </template>
                </div>
              </div>
            </div>

            <div class="hidden md:flex flex-col w-[360px] h-full relative">
              <ConfirmationList />
            </div>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
    <ConformAndRejectModal />
    <DocumentFileModal @onUpdate="emits('onUpdate')" />
    <ConfirmSignatureModal
      v-model:visible="confirmSignatureVisible"
      @onConfirm="onConfirmSignature"
    />
  </div>
</template>

<style scoped>
  .vertical-text {
    writing-mode: vertical-rl;
  }
</style>
