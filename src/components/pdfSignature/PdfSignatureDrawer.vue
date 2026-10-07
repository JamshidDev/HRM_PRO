<script setup>
  import {
    ArrowSyncCircle16Filled,
    Dismiss20Regular,
    Signature20Regular,
    CheckmarkCircle20Filled,
    DismissCircle20Filled,
    Eye20Regular,
    Attach20Regular,
    People20Regular
  } from '@vicons/fluent'
  import { useMediaQuery } from '@vueuse/core'
  import { useAppBreakpoints } from '@/composables/useBreakpoint.js'
  import { UIUser, UILottieReader, UISegmentTabs } from '@/components/index.js'
  import CommandDataTab from '@/pages/docFlow/document/command/CommandDataTab.vue'
  import AttachmentPreview from './ui/AttachmentPreview.vue'
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
  import { buildApprovalHistory, lastActionDate } from './utils/approvalHistory.js'
  import LeftContent from './ui/LeftContent.vue'
  import DrawerSkeleton from './ui/DrawerSkeleton.vue'
  import ConfirmSignatureModal from './ui/ConfirmSignatureModal.vue'
  import Utils from '../../utils/Utils.js'
  import { useRoute } from 'vue-router'
  import PdfViewer from '@/components/pdfSignature/PdfViewer.vue'
  import ConformAndRejectModal from '@/components/pdfSignature/ui/ConformAndRejectModal.vue'
  import DocumentFileModal from '@/components/pdfSignature/ui/DocumentFileModal.vue'
  import ForwardApplicationModal from '@/components/pdfSignature/ui/ForwardApplicationModal.vue'
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

  // Yon panellar: o'ng (kelishuvchilar) `lg` dan, chap (biriktirilgan hujjatlar) 1200px dan
  // joyida turadi. Undan tor ekranda markaz siqilmasin — panel header tugmasi orqali
  // yon drawer'da ochiladi (aks holda mobil'da ularga umuman kirib bo'lmasdi).
  const { isDesktop: showRightInline } = useAppBreakpoints()
  // 1200px — chap panel joyida turadigan va header tugmalari matnli bo'ladigan chegara.
  const isWide = useMediaQuery('(min-width: 1200px)')
  const showLeftInline = isWide
  const leftPanelVisible = ref(false)
  const rightPanelVisible = ref(false)
  watch(showLeftInline, (v) => v && (leftPanelVisible.value = false))
  watch(showRightInline, (v) => v && (rightPanelVisible.value = false))
  // Faylni ko'rish uchun tanlanganda drawer yopiladi — preview uning ostida qolmasin.
  watch(
    () => store.previewFile,
    (v) => v && (leftPanelVisible.value = false)
  )
  const signatureInfoVisible = ref(false)
  const resendActionsVisible = ref(false)

  const isSigned = computed(() => store.document?.document?.confirmation?.id === 3)
  const isRejected = computed(() => store.document?.document?.confirmation?.id === 4)
  // Rad etish: backend `document.rejection` (sabab, kim, qachon); eski maydonlar zaxira.
  const rejection = computed(() => store.document?.document?.rejection || null)
  const rejectReason = computed(() => {
    return (
      rejection.value?.reason ||
      store.document?.document?.comment ||
      store.confirmations?.find((v) => v.status?.id === 4)?.comment ||
      null
    )
  })
  const rejectedBy = computed(() => {
    const b = rejection.value?.by
    return b ? [b.last_name, b.first_name].filter(Boolean).join(' ') : null
  })
  const hasDocumentFile = computed(() => !!store.pdfUrl)

  // Buyruqda header markazida tablar: «Hujjat» (ko'rish/imzolash) va «Ma'lumotlar» (forma).
  const isCommand = computed(() => store.model === Utils.documentModels.command)
  const activeTab = computed({
    get: () => store.centerTab,
    set: (v) => (store.centerTab = v)
  })
  // «Ma'lumotlar»ga o'tishda chapga, «Hujjat»ga qaytishda o'ngga suriladi.
  const tabTransition = computed(() =>
    activeTab.value === 'data' ? 'tab-slide-left' : 'tab-slide-right'
  )
  const tabs = computed(() => [
    { id: 'document', name: t('documentPage.command.dataTab.tabDocument') },
    { id: 'data', name: t('documentPage.command.dataTab.tabData') }
  ])

  // Qayta rasmiylashtirilgach — hujjat yangi PDF bilan qayta ochiladi.
  const onDataSaved = () => {
    activeTab.value = 'document'
    getDocument(store.document_id, store.model)
  }

  // Joriy foydalanuvchining hujjatga nisbatan holati: imzolashi mumkin / imzolagan /
  // rad etgan / hujjat unga imzolashga kelmagan.
  const selfConfirmation = computed(() =>
    store.confirmations?.find((v) => v.worker?.id === accountStore.account?.worker?.id)
  )
  const signState = computed(() => {
    if (store.permissions?.canSignature && !isSigned.value) return 'sign'
    if (selfConfirmation.value?.status?.id === 3) return 'signed'
    if (selfConfirmation.value?.status?.id === 4) return 'rejected'
    return 'none'
  })
  // O'z harakati vaqti (imzolagan / rad etgan) — backend tarixidan.
  const selfActedAt = computed(() => {
    if (!selfConfirmation.value) return null
    const [events] = buildApprovalHistory([selfConfirmation.value]).bySigner
    return lastActionDate(events)
  })

  const signStateMeta = computed(
    () =>
      ({
        signed: {
          icon: CheckmarkCircle20Filled,
          label: 'documentPage.signature.approval.youSigned',
          sub: 'documentPage.signature.approval.signedWithEri',
          text: 'text-fig-chip-green-text',
          badge: 'bg-fig-chip-green text-fig-chip-green-text',
          border: 'border-fig-green-100'
        },
        rejected: {
          icon: DismissCircle20Filled,
          label: 'documentPage.signature.approval.youRejected',
          sub: null,
          text: 'text-fig-text-red',
          badge: 'bg-fig-red-100 text-fig-text-red',
          border: 'border-fig-red-100'
        },
        none: {
          icon: Eye20Regular,
          label: 'documentPage.signature.approval.notForYou',
          sub: 'documentPage.signature.approval.notForYouSub',
          text: 'text-textColor0',
          badge: 'bg-fig-chip-indigo text-fig-chip-indigo-text',
          border: 'border-fig-indigo-100'
        }
      })[signState.value]
  )

  // Rad etilgan ariza — pastdagi qotgan panelda sabab va keyingi qadam (kim/qachon tarixda).
  const docRejectedPanel = computed(() => isApplication.value && isRejected.value)
  const isClosedDoc = computed(() => !!store.document?.document?.closed)
  // Ariza egasiga yopilganda qo'shimcha izoh kerak emas (sarlavha yetarli).
  const rejectedHint = computed(() => {
    const owner = selfConfirmation.value?.type === 'w'
    if (owner && isClosedDoc.value) return null
    const key = `${owner ? 'Owner' : 'Other'}${isClosedDoc.value ? 'Closed' : 'Pending'}`
    return `documentPage.signature.rejectedPanel.hint${key}`
  })
  // Ariza egasiga — «Arizangiz rad etildi», boshqalarga — holat (yopilgan / rad etilgan).
  const rejectedTitle = computed(() => {
    if (selfConfirmation.value?.type === 'w')
      return 'documentPage.signature.rejectedPanel.titleOwner'
    return isClosedDoc.value
      ? 'documentPage.signature.rejectedPanel.titleClosed'
      : 'documentPage.signature.rejectedPanel.title'
  })
  // Uzun sabab — 2 qatorga qisqartiriladi, «Batafsil» bilan to'liq ochiladi.
  const reasonExpanded = ref(false)
  watch(
    () => store.document_id,
    () => (reasonExpanded.value = false)
  )
  const reasonLong = computed(() => (rejectReason.value?.length || 0) > 90)

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

  // HR: «Jarayonda» va hali yo'naltirilmagan ariza (rahbar qatori yo'q) — imzolash/yo'naltirish.
  const isApplication = computed(() => store.model === Utils.documentModels.workerApplication)
  const hasDirector = computed(() => store.confirmations?.some((c) => c.type === 'd'))
  const hrSigned = computed(() =>
    store.confirmations?.some((c) => c.type === 's' && c.order === 2 && c.status?.id === 3)
  )
  // Backend bilan bir xil: yo'naltirilgan = HR imzolagan va rahbar qatori bor.
  const isForwarded = computed(() => hasDirector.value && hrSigned.value)
  // Eski tartib: rahbar yaratishda qo'shilgan, HR marshruti yo'q — faqat yopish mumkin.
  const isLegacy = computed(() => hasDirector.value && !hrSigned.value)
  // HR paneli: yangi (imzolash) / jarayonda (o'zgartirish) / rad etilgan (qayta yuborish) — HR yopmagan bo'lsa.
  const docConfirmation = computed(() => store.document?.document?.confirmation?.id)
  const hrStage = computed(() => {
    if (route.path !== '/hrm/application' || store.document?.document?.closed) return null
    if (isLegacy.value && [1, 4].includes(docConfirmation.value)) return 'legacy'
    if (docConfirmation.value === 1) return isForwarded.value ? 'process' : 'new'
    if (docConfirmation.value === 4 && isForwarded.value) return 'rejected'
    return null
  })
  const showConfirmButtons = computed(() => hrStage.value !== null)
  // Kelishuvchi yoki rahbar tasdiqlagan bo'lsa, rad etilmaguncha HR yopa olmaydi.
  const approverSigned = computed(() =>
    store.confirmations?.some(
      (c) => c.status?.id === 3 && (c.type === 'd' || (c.type === 's' && c.order >= 3))
    )
  )
  const canClose = computed(
    () =>
      hrStage.value === 'rejected' ||
      (hrStage.value === 'legacy' && (docConfirmation.value === 4 || !approverSigned.value)) ||
      (hrStage.value === 'new' && !hrSigned.value) ||
      (hrStage.value === 'process' && !approverSigned.value)
  )
  const hrPanelTitle = computed(
    () =>
      ({
        new: 'documentPage.signature.approval.yourTurn',
        process: 'applicationPage.forward.panelProcessTitle',
        rejected: 'applicationPage.forward.panelRejectedTitle',
        legacy: 'applicationPage.forward.panelLegacyTitle'
      })[hrStage.value]
  )
  const hrPanelSub = computed(
    () =>
      ({
        new: 'applicationPage.forward.panelSub',
        process: 'applicationPage.forward.panelProcess',
        rejected: 'applicationPage.forward.panelRejected',
        legacy: 'applicationPage.forward.panelLegacy'
      })[hrStage.value]
  )
  const hrDirector = () => ({
    ...store.confirmations?.find((c) => c.type === 'd')?.worker,
    worker_id: store.confirmations?.find((c) => c.type === 'd')?.worker?.id,
    position: store.confirmations?.find((c) => c.type === 'd')?.position
  })
  const onHrPrimary = () => {
    if (hrStage.value === 'new') return openConfirmModal(true)
    applicationStore._openRoute(
      store.document_id,
      hrStage.value === 'rejected' ? 'resend' : 'edit',
      hrDirector()
    )
  }

  const showEditButton = computed(() => {
    const rejects = ['/docflow/conf-report']
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
    leftPanelVisible.value = false
    rightPanelVisible.value = false
    activeTab.value = 'document'

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
        // Hujjatlar ro'yxatidan ochilganda signatureId kelmaydi — o'z confirmation'im javobdan olinadi.
        if (!v.confirmations?.some((c) => c.id === store.signatureId)) {
          store.signatureId = v.signature?.current_user?.id ?? null
        }

        // Ariza rahbar imzosi bilan kuchga kiradi — tanishuvchi/kelishuvchiga ham rahbar ko'rsatiladi.
        const signer =
          model === Utils.documentModels.workerApplication
            ? v.confirmations?.find((c) => c.type === 'd') || v.signature?.current_user
            : v.signature?.current_user
        const worker = signer?.worker
        store.signatureMan = {
          photo: worker?.photo,
          lastName: worker?.last_name,
          firstName: worker?.first_name,
          middleName: worker?.middle_name,
          position: signer?.position
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
      .catch((e) => {
        console.error('[pdfSignature] getDocument', e)
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
    if (v) onHrSign()
  }

  // HR imzolaydi (imzolagan bo'lsa o'tkazib yuboriladi), so'ng kelishuvchilar modali ochiladi.
  const onHrSign = () => {
    applicationStore._signStart(store.document_id, (res) => {
      if (res.signed) return applicationStore.openForward(res.director)
      signatureStore.confirmationId = res.confirmation_id
      signatureStore.documentType = store.model
      signatureStore._signatureDocument(
        signatureStore.signatureTypes.contract,
        store.document_id,
        () => {
          signatureStore.visible = false
          notify.success(t('documentPage.signature.confirmedNotification'))
          getDocument(store.document_id, store.model)
          applicationStore.openForward(res.director)
        }
      )
    })
  }

  const onRejected = () => {
    emits('signatureEv')
  }

  const onForwarded = () => {
    notify.success(t('applicationPage.forward.done'))
    emits('signatureEv')
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
          class="w-full h-screen overflow-hidden flex flex-col relative gap-3 pb-3 bg-gradient-to-b from-surface-ground to-surface-section"
        >
          <!-- Mobil'da tablar ikkinchi qatorga tushadi; `md` dan header markazida turadi.
               Tugma matnlari 1200px dan ko'rinadi, undan torda faqat ikonka. -->
          <div
            class="relative w-full shrink-0 border-b border-surface-line flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2 px-3 py-2.5 md:px-4 md:py-0 md:h-[60px] bg-surface-section"
          >
            <div class="flex items-center gap-x-3 min-w-0">
              <n-button
                @click="onClose()"
                quaternary
                circle
                size="large"
                class="bg-surface-ground!"
              >
                <template #icon>
                  <n-icon size="20">
                    <Dismiss20Regular />
                  </n-icon>
                </template>
              </n-button>
              <div v-if="store.loading" class="hidden min-[1200px]:flex flex-col gap-1.5">
                <n-skeleton width="220px" height="16px" :sharp="false" class="rounded-md" />
                <n-skeleton width="80px" height="11px" :sharp="false" class="rounded-md" />
              </div>
              <div v-else class="hidden min-[1200px]:block min-w-0">
                <div
                  class="text-sm font-semibold text-textColor1 leading-tight truncate max-w-[280px]"
                >
                  {{ store.document?.document?.file_name }}
                </div>
                <div class="text-xs text-gray-400 tabular-nums">
                  {{ Utils.timeOnlyDate(store?.document?.document?.created) }}
                  {{ Utils.timeOnlyHour(store?.document?.document?.created) }}
                </div>
              </div>
            </div>
            <div
              v-if="isCommand && !store.loading"
              class="order-last w-full flex justify-center md:order-none md:w-auto md:absolute md:left-1/2 md:-translate-x-1/2"
            >
              <UISegmentTabs v-model="activeTab" :tabs="tabs" variant="surface" />
            </div>
            <div v-if="store.loading" class="hidden md:flex gap-3">
              <n-skeleton width="110px" height="34px" :sharp="false" class="rounded-md" />
              <n-skeleton width="110px" height="34px" :sharp="false" class="rounded-md" />
              <n-skeleton width="110px" height="34px" :sharp="false" class="rounded-md" />
            </div>
            <div v-else class="flex items-center gap-2 md:gap-3">
              <n-button
                v-if="store.permissions.canEdit && showEditButton"
                @click="onEdit"
                tertiary
                :title="$t('content.edit')"
              >
                <template v-if="isWide">{{ $t('content.edit') }}</template>
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
                :title="$t('documentPage.signature.downloadPdf')"
              >
                <div class="flex items-center gap-2">
                  <n-icon size="16">
                    <PdfFileIcon />
                  </n-icon>
                  <span v-if="isWide">
                    {{ $t('documentPage.signature.downloadPdf') }}
                  </span>
                </div>
              </n-button>
              <n-button
                v-if="!showSignature && store?.docxUrl && !store.viewerLoading"
                tag="a"
                target="_blank"
                :href="store?.docxUrl"
                download
                type="info"
                :title="$t('documentPage.signature.downloadWord')"
              >
                <div class="flex items-center gap-2">
                  <n-icon size="16">
                    <WordFileIcon />
                  </n-icon>
                  <span v-if="isWide">
                    {{ $t('documentPage.signature.downloadWord') }}
                  </span>
                </div>
              </n-button>
              <n-button
                v-if="!showLeftInline"
                secondary
                :title="$t('documentPage.signature.attachedDocuments')"
                @click="leftPanelVisible = true"
              >
                <template #icon>
                  <n-icon size="18"><Attach20Regular /></n-icon>
                </template>
              </n-button>
              <n-button
                v-if="!showRightInline"
                secondary
                :title="$t('documentPage.signature.approval.title')"
                @click="rightPanelVisible = true"
              >
                <template #icon>
                  <n-icon size="18"><People20Regular /></n-icon>
                </template>
              </n-button>
            </div>
          </div>

          <DrawerSkeleton v-if="store.loading" class="px-3" />
          <div v-else class="w-full flex-1 min-h-0 flex gap-3 px-2 md:px-3">
            <div
              v-if="showLeftInline"
              class="flex flex-col w-[280px] xl:w-[300px] shrink-0 h-full gap-3 relative"
            >
              <div class="w-full flex-1 min-h-0">
                <LeftContent />
              </div>
              <div
                v-if="store.permissions?.qrcode"
                class="shrink-0 bg-gray-300 rounded-xl border border-gray-400 h-[100px]"
              ></div>
            </div>

            <!-- Faqat markaziy qism almashadi; yon panellar joyida qoladi -->
            <div class="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden">
              <Transition :name="tabTransition" mode="out-in">
                <div
                  v-if="isCommand && activeTab === 'data'"
                  key="data"
                  class="h-full flex flex-col"
                >
                  <CommandDataTab
                    :command-id="store.document_id"
                    @saved="onDataSaved"
                    @open-source="(v) => getDocument(v.id, v.model)"
                  />
                </div>
                <div v-else key="document" class="relative h-full flex flex-col">
                  <!-- Biriktirilgan fayl — buyruq PDF'i ustida; PDF ko'ruvchisi fonda saqlanadi -->
                  <AttachmentPreview
                    v-if="store.previewFile"
                    class="absolute inset-0 z-20"
                    :file="store.previewFile"
                    @close="store.previewFile = null"
                  />
                  <div
                    v-if="isSigned && showSignature"
                    class="w-full shrink-0 rounded-2xl bg-surface-section px-4 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-3"
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
                    v-else-if="isRejected && showSignature && !isApplication"
                    class="w-full shrink-0 rounded-2xl border border-fig-br-error bg-fig-red-50 px-4 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-3"
                  >
                    <div class="min-w-0 flex items-start gap-3">
                      <n-icon size="20" class="text-fig-text-red mt-0.5 shrink-0">
                        <DismissCircle20Filled />
                      </n-icon>
                      <div class="min-w-0">
                        <div class="font-semibold text-fig-text-red">
                          {{ $t('documentPage.signature.rejected') }}
                        </div>
                        <div v-if="rejectReason" class="text-sm text-textColor1 mt-0.5">
                          {{ $t('documentPage.signature.rejectedReason') }}: {{ rejectReason }}
                        </div>
                        <div class="text-xs text-fig-text-secondary mt-0.5">
                          <template v-if="rejectedBy">{{ rejectedBy }} · </template>
                          {{
                            Utils.timeOnlyDate(rejection?.at || store.document?.document?.created)
                          }}
                        </div>
                      </div>
                    </div>
                    <!-- Arizani qayta yuborish — faqat HR panelidan (pastda) -->
                    <template v-if="isApplication" />
                    <n-button
                      v-else-if="!resendActionsVisible"
                      type="success"
                      class="shrink-0"
                      @click="resendActionsVisible = true"
                    >
                      {{ $t('documentPage.signature.resend') }}
                    </n-button>
                    <div v-else class="flex items-center gap-2 shrink-0">
                      <n-button
                        quaternary
                        circle
                        size="small"
                        @click="resendActionsVisible = false"
                      >
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

                  <div @wheel="onWheelEv" class="flex-1 min-h-0 overflow-auto pb-20">
                    <template v-if="store.viewerLoading">
                      <div class="w-full flex justify-center items-center">
                        <div>
                          <UILottieReader
                            style="height: calc(100vh - 160px)"
                            :file-url="generateFile"
                            :auto-run="true"
                          />
                          <h2
                            class="-mt-28 text-2xl text-center text-gray-400 font-medium animate-bounce"
                          >
                            {{ $t('content.preparingDocument') }}
                          </h2>
                          <div class="w-full flex justify-center mt-2">
                            <n-button size="medium" round @click="() => emits('onUpdate')">
                              <template #icon>
                                <n-icon size="32">
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
                          class="w-14 h-14 rounded-2xl bg-fig-chip-brand flex items-center justify-center mb-4"
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

                  <!-- Imzolash paneli: hujjat ustida pastda, markazda suzuvchi karta -->
                  <div
                    class="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center px-3"
                  >
                    <div
                      class="pointer-events-auto floating-sign-panel"
                      :class="
                        showConfirmButtons || signState === 'sign'
                          ? 'border-fig-blue-100'
                          : docRejectedPanel
                            ? 'border-fig-red-100 rejected-panel'
                            : signStateMeta.border
                      "
                    >
                      <!-- HR: arizani rad etish yoki imzolab kelishuvchilarga yo'naltirish (buyruqlardagi kabi) -->
                      <div v-if="showConfirmButtons" class="flex items-center gap-3 sm:pl-1">
                        <div
                          class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-fig-chip-brand text-fig-chip-brand-text"
                        >
                          <n-icon size="18"><Signature20Regular /></n-icon>
                        </div>
                        <div class="hidden sm:block min-w-0 leading-tight mr-2">
                          <div class="text-[13px] font-semibold text-textColor0 whitespace-nowrap">
                            {{ $t(hrPanelTitle) }}
                          </div>
                          <div class="text-[11px] text-textColor3 mt-0.5 whitespace-nowrap">
                            {{ $t(hrPanelSub) }}
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                          <n-button
                            v-if="canClose"
                            type="error"
                            secondary
                            round
                            class="px-3!"
                            :loading="applicationStore.modalLoading"
                            :disabled="
                              applicationStore.modalLoading || applicationStore.signStartLoading
                            "
                            @click="openConfirmModal(false)"
                          >
                            <template #icon>
                              <n-icon><Dismiss20Regular /></n-icon>
                            </template>
                            {{
                              hrStage === 'new'
                                ? $t('documentPage.signature.rejectSubmit')
                                : $t('applicationPage.forward.closeApplication')
                            }}
                          </n-button>
                          <n-button
                            v-if="hrStage !== 'legacy'"
                            type="primary"
                            round
                            class="px-5! sm:px-9! font-semibold"
                            :loading="
                              applicationStore.signStartLoading ||
                              applicationStore.routeLoading ||
                              signatureStore.loading
                            "
                            :disabled="applicationStore.modalLoading"
                            @click="onHrPrimary"
                          >
                            <template #icon>
                              <n-icon><Signature20Regular /></n-icon>
                            </template>
                            {{
                              hrStage === 'rejected'
                                ? $t('applicationPage.forward.resendTitle')
                                : hrStage === 'process'
                                  ? $t('applicationPage.forward.editTitle')
                                  : hrSigned
                                    ? $t('applicationPage.forward.setApprovers')
                                    : $t('documentPage.signature.approval.sign')
                            }}
                          </n-button>
                        </div>
                      </div>
                      <!-- Imzolash navbati: chapda izoh, o'ngda amallar — holat kartochkasi bilan bir uslubda -->
                      <div v-else-if="signState === 'sign'" class="flex items-center gap-3 sm:pl-1">
                        <div
                          class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-fig-chip-brand text-fig-chip-brand-text"
                        >
                          <n-icon size="18"><Signature20Regular /></n-icon>
                        </div>
                        <div class="hidden sm:block min-w-0 leading-tight mr-2">
                          <div class="text-[13px] font-semibold text-textColor0 whitespace-nowrap">
                            {{ $t('documentPage.signature.approval.yourTurn') }}
                          </div>
                          <div class="text-[11px] text-textColor3 mt-0.5 whitespace-nowrap">
                            {{ $t('documentPage.signature.approval.yourTurnSub') }}
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                          <n-button
                            type="error"
                            secondary
                            round
                            class="px-3!"
                            :disabled="signatureStore.loading"
                            @click="openRejectModal"
                          >
                            <template #icon>
                              <n-icon><Dismiss20Regular /></n-icon>
                            </template>
                            {{ $t('documentPage.signature.rejectSubmit') }}
                          </n-button>
                          <n-button
                            type="primary"
                            round
                            class="px-5! sm:px-9! font-semibold"
                            :loading="signatureStore.loading"
                            @click="onSaveSignature"
                          >
                            <template #icon>
                              <n-icon><Signature20Regular /></n-icon>
                            </template>
                            {{ $t('documentPage.signature.approval.sign') }}
                          </n-button>
                        </div>
                      </div>
                      <!-- Rad etilgan ariza: sabab + keyingi qadam (qotgan, har doim ko'rinadi) -->
                      <div
                        v-else-if="docRejectedPanel"
                        class="flex items-start gap-3 pl-1 pr-4 py-1"
                      >
                        <div
                          class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-fig-red-100 text-fig-text-red"
                        >
                          <n-icon size="18"><DismissCircle20Filled /></n-icon>
                        </div>
                        <div class="min-w-0 leading-snug">
                          <div class="text-[14px] font-bold text-fig-text-red">
                            {{ $t(rejectedTitle) }}
                          </div>
                          <div
                            v-if="rejectReason"
                            class="text-[13px] text-textColor1 mt-0.5 whitespace-pre-line break-words"
                            :class="
                              !reasonExpanded && reasonLong
                                ? 'line-clamp-2'
                                : 'max-h-40 overflow-y-auto pr-1'
                            "
                          >
                            <span class="font-medium"
                              >{{ $t('documentPage.signature.rejectedPanel.reason') }}:</span
                            >
                            {{ rejectReason }}
                          </div>
                          <button
                            v-if="reasonLong"
                            type="button"
                            class="text-[12px] font-medium text-primary mt-0.5 hover:underline"
                            @click="reasonExpanded = !reasonExpanded"
                          >
                            {{
                              $t(
                                reasonExpanded
                                  ? 'documentPage.signature.rejectedPanel.less'
                                  : 'documentPage.signature.rejectedPanel.more'
                              )
                            }}
                          </button>
                          <div
                            v-if="rejectedHint"
                            class="text-[12px] text-fig-text-secondary mt-0.5"
                          >
                            {{ $t(rejectedHint) }}
                          </div>
                        </div>
                      </div>
                      <!-- Holat kartochkasi: rangli ikonka doirasi + sarlavha va izoh (vaqt) -->
                      <div v-else class="flex items-center gap-2.5 pl-1 pr-4 py-0.5">
                        <div
                          class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          :class="signStateMeta.badge"
                        >
                          <n-icon size="18"><component :is="signStateMeta.icon" /></n-icon>
                        </div>
                        <div class="min-w-0 leading-tight">
                          <div class="text-[13px] font-semibold" :class="signStateMeta.text">
                            {{ $t(signStateMeta.label) }}
                          </div>
                          <div
                            v-if="signStateMeta.sub || selfActedAt"
                            class="text-[11px] text-textColor3 tabular-nums mt-0.5"
                          >
                            <template v-if="signStateMeta.sub">{{
                              $t(signStateMeta.sub)
                            }}</template>
                            <template v-if="signStateMeta.sub && selfActedAt"> · </template>
                            <template v-if="selfActedAt">{{
                              selfActedAt.format('DD.MM.YYYY HH:mm')
                            }}</template>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <div
              v-if="showRightInline"
              class="flex flex-col w-[320px] xl:w-[360px] shrink-0 h-full relative"
            >
              <ConfirmationList />
            </div>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
    <!-- Tor ekranda yon panellar shu drawer'larda ochiladi -->
    <n-drawer
      v-if="!showLeftInline"
      v-model:show="leftPanelVisible"
      placement="left"
      width="min(320px, 88vw)"
    >
      <div class="h-full flex flex-col p-2 bg-surface-ground">
        <LeftContent />
      </div>
    </n-drawer>
    <n-drawer
      v-if="!showRightInline"
      v-model:show="rightPanelVisible"
      placement="right"
      width="min(380px, 92vw)"
    >
      <div class="h-full flex flex-col p-2 bg-surface-ground">
        <ConfirmationList />
      </div>
    </n-drawer>
    <ConformAndRejectModal @rejected="onRejected" />
    <ForwardApplicationModal @forwarded="onForwarded" />
    <DocumentFileModal />
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
  .floating-sign-panel {
    padding: 6px;
    border-radius: 9999px;
    /* Rang holatga qarab Tailwind klassi bilan beriladi */
    border-width: 1px;
    border-style: solid;
    background-color: var(--surface-section);
    box-shadow: 0 8px 24px rgb(16 24 40 / 0.12);
  }
  /* Rad etilgan ariza — ko'p qatorli karta, pastdan chiqadi */
  .floating-sign-panel.rejected-panel {
    border-radius: 16px;
    max-width: 560px;
    padding: 10px 12px;
    animation: rejected-panel-in 260ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  @keyframes rejected-panel-in {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .floating-sign-panel.rejected-panel {
      animation: none;
    }
  }
  .tab-slide-left-enter-active,
  .tab-slide-left-leave-active,
  .tab-slide-right-enter-active,
  .tab-slide-right-leave-active {
    transition:
      opacity 0.22s ease,
      transform 0.22s ease;
  }
  .tab-slide-left-enter-from,
  .tab-slide-right-leave-to {
    opacity: 0;
    transform: translateX(40px);
  }
  .tab-slide-left-leave-to,
  .tab-slide-right-enter-from {
    opacity: 0;
    transform: translateX(-40px);
  }
</style>
