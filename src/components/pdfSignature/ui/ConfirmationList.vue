<script setup>
  import { usePdfViewerStore, useAccountStore } from '@/store/modules/index.js'
  import { Copy20Regular, ArrowLeft20Filled, People20Regular, History20Regular } from '@vicons/fluent'
  import i18 from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import { useRoute } from 'vue-router'
  import { AppPaths } from '@/utils/index.js'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import ChatCotent from '../chat/ChatCotent.vue'
  import SignerCard from './SignerCard.vue'
  import ApprovalHistory from './ApprovalHistory.vue'
  import { buildApprovalHistory, STATUS } from '../utils/approvalHistory.js'
  const { t } = i18.global

  const store = usePdfViewerStore()
  const accountStore = useAccountStore()
  const route = useRoute()

  const isSelf = (item) => item.worker?.id === accountStore.account?.worker?.id

  const chatWith = ref(null)
  const activeTab = ref('signers')

  // Tarix FAQAT backenddan keladi (`confirmations[].histories`).
  const history = computed(() => buildApprovalHistory(store.confirmations))

  // Marshrut ko'rinishi. Kelishuvchilar (`s`) har xil `order` da bo'lsa — tartibli (navbat bilan),
  // hammasi bir xil bo'lsa — parallel. Tanishuvchilar (`r`) navbatda turmaydi va pastda ko'rsatiladi.
  // Faqat buyruqda: Arizada HR bosqichi ham `s` (order 2) — u yerda bu hisob noto'g'ri «tartibli» derdi.
  const showRoute = computed(() => store.model === Utils.documentModels.command)
  const signers = computed(() =>
    showRoute.value ? (store.confirmations || []).filter((c) => c.type === 's') : []
  )
  const isSequential = computed(() => new Set(signers.value.map((c) => c.order)).size > 1)
  // Navbat raqami — `order` bo'yicha o'rni (1, 2, 3 ...).
  const stepOf = computed(() => {
    if (!isSequential.value) return new Map()
    const orders = [...new Set(signers.value.map((c) => c.order))].sort((a, b) => a - b)
    return new Map(signers.value.map((c) => [c, orders.indexOf(c.order) + 1]))
  })
  // Hozirgi navbat — hali imzolamagan kelishuvchilarning eng kichik `order` i.
  const pending = (c) => [STATUS.process, STATUS.read].includes(c.status?.id)
  const currentOrder = computed(() => {
    const list = signers.value.filter(pending).map((c) => c.order)
    return list.length ? Math.min(...list) : null
  })
  const isCurrent = (c) => isSequential.value && c.type === 's' && pending(c) && c.order === currentOrder.value
  const isWaiting = (c) => isSequential.value && c.type === 's' && pending(c) && c.order > currentOrder.value
  // Asl indeks saqlanadi — tarix (`history.bySigner`) shu indeks bo'yicha.
  const rows = computed(() => {
    const list = (store.confirmations || []).map((item, idx) => ({ item, idx }))
    const is = (t) => (r) => r.item.type === t
    // Rahbar (`d`) har qanday hujjatda (shartnoma, ariza...) eng tepada — u navbatsiz,
    // istalgan paytda imzolaydi; qolganlar backend bergan tartibda.
    if (!showRoute.value) return [...list.filter(is('d')), ...list.filter((r) => !is('d')(r))]
    // Buyruqda: rahbardan keyin qolganlar, oxirida tanishuvchilar.
    return [
      ...list.filter(is('d')),
      ...list.filter((r) => r.item.type !== 'd' && r.item.type !== 'r'),
      ...list.filter(is('r'))
    ]
  })
  const firstViewerIdx = computed(() =>
    showRoute.value ? rows.value.findIndex((r) => r.item.type === 'r') : -1
  )

  // Marshrutli hujjatda link har imzolovchi kartasida (faqat HR), boshqalarda — faqat xodimda.
  const LINK_PERMS = {
    [Utils.documentModels.command]: accountStore.pn.hrCommandsWrite,
    [Utils.documentModels.contract]: accountStore.pn.hrContractsWrite,
    [Utils.documentModels.adContract]: accountStore.pn.hrContractAdditionalWrite
  }
  const canLink = (item) => {
    if (!isDocFlow.value || store.viewerLoading || item.status?.id === 3) return false
    const perm = LINK_PERMS[store.model]
    if (!perm) return item.type === 'w'
    return ['w', 's', 'd'].includes(item.type) && accountStore.checkPermission(perm)
  }

  // Tasdiqlangan yoki rahbar rad etib yopgan hujjatga link berilmaydi — tugma bosilsa sababi aytiladi.
  const linkBlockedReason = (item) => {
    const docStatus = store.document?.document?.confirmation?.id
    const afterApproval = store.model === Utils.documentModels.materialLiability && item.type === 'w'
    if (docStatus === 3 && !afterApproval) return t('signature.linkDocApproved')
    const directorRejected = (store.confirmations || []).some(
      (c) => c.type === 'd' && c.status?.id === STATUS.rejected
    )
    if (docStatus === 4 && directorRejected) return t('signature.linkDocClosed')
    return null
  }

  const generateLink = (v) => {
    const reason = linkBlockedReason(v)
    if (reason) {
      $Alert.warning(reason)
      return
    }
    store._generateLink({ confirmation_id: v.id, model: store.model })
  }

  // Link oynasidagi teskari sanoq (qat'iy 5 daqiqa).
  const now = ref(Date.now())
  let timer = null
  watch(
    () => [store.linkVisible, store.linkDeadline],
    ([v]) => {
      clearInterval(timer)
      now.value = Date.now()
      if (v) timer = setInterval(() => (now.value = Date.now()), 1000)
    }
  )
  onBeforeUnmount(() => clearInterval(timer))
  const linkLeft = computed(() =>
    store.linkDeadline ? Math.max(0, Math.ceil((store.linkDeadline - now.value) / 1000)) : 0
  )
  const linkExpired = computed(() => !!store.link && !store.linkLoading && linkLeft.value === 0)
  const linkLeftText = computed(
    () => `${Math.floor(linkLeft.value / 60)}:${String(linkLeft.value % 60).padStart(2, '0')}`
  )

  const copyLink = () => {
    Utils.copyToClipboard(store.link, () => {
      $Toast.info(t('signature.copied'))
    })
  }

  const isDocFlow = computed(() => {
    return !route.fullPath.includes(AppPaths.DocFlow)
  })

  // Chatga kirganda ro'yxat chapga surilib, chat o'ngdan kiradi; orqaga
  // qaytganda — teskarisi. Yo'nalish shu nom orqali tanlanadi.
  const slideName = ref('slide-forward')

  const onOpenChat = (item) => {
    slideName.value = 'slide-forward'
    chatWith.value = item
  }

  const onCloseChat = () => {
    slideName.value = 'slide-back'
    chatWith.value = null
    store.payload.recipient_id = null
  }
</script>

<template>
  <SectionHeader full-height tight-body>
    <template #header>
      <div class="slide-stage w-full min-w-0 overflow-x-clip">
        <Transition :name="slideName">
          <!-- Ikkala sarlavha ham `h-6`: chatga o'tganda bar balandligi o'zgarmasin -->
          <div v-if="chatWith" class="slide-pane flex items-center gap-1.5 min-w-0 h-6">
            <n-button quaternary circle size="tiny" class="-ml-1" @click="onCloseChat">
              <template #icon>
                <n-icon size="16">
                  <ArrowLeft20Filled />
                </n-icon>
              </template>
            </n-button>
            <span class="font-semibold text-textColor0 truncate">
              {{ chatWith.worker.last_name }} {{ chatWith.worker.first_name }}
            </span>
          </div>
          <div v-else class="slide-pane flex items-center gap-2 min-w-0 w-full h-6">
            <span class="font-semibold text-textColor0 truncate">{{ $t('documentPage.signature.approval.title') }}</span>
            <n-badge v-if="store.document?.chats" :value="store.document.chats" :max="99" />
          </div>
        </Transition>
      </div>
    </template>

    <!-- `overflow-x: clip`: surilish paytida gorizontal skroll chiqmasin
         (`hidden` dan farqli, yangi skroll konteyner yaratmaydi). -->
    <div class="slide-stage h-full overflow-x-clip">
      <Transition :name="slideName">
        <ChatCotent
          v-if="chatWith"
          class="slide-pane"
          :forced-recipient-worker-id="chatWith.worker.id"
        />

        <!-- `pr-2`: kartalar skroll chizig'iga tegmasin (Edge/Windows 11 da u kontent
             ustida chiziladi va kartaning o'ng chetini yopib qo'yardi). -->
        <div v-else class="slide-pane pr-2">
          <UITabs v-model:value="activeTab" type="segment" size="small" animated class="mb-2">
            <n-tab name="signers">
              <div class="flex items-center gap-1.5">
                <n-icon size="16"><People20Regular /></n-icon>
                {{ $t('documentPage.signature.approval.signers') }}
              </div>
            </n-tab>
            <n-tab name="history">
              <div class="flex items-center gap-1.5">
                <n-icon size="16"><History20Regular /></n-icon>
                {{ $t('documentPage.signature.approval.history') }}
              </div>
            </n-tab>
          </UITabs>

          <div v-if="activeTab === 'signers'">
            <!-- Marshrut turi: parallel yoki tartibli -->
            <div
              v-if="signers.length"
              class="flex items-center gap-2 mb-1.5 px-1 text-xs text-textColor3"
            >
              <span
                class="shrink-0 whitespace-nowrap text-[11px] font-semibold rounded-full px-2 py-0.5 bg-fig-chip-brand text-fig-chip-brand-text"
              >
                {{
                  $t(
                    isSequential
                      ? 'documentPage.command.form.route.sequential'
                      : 'documentPage.command.form.route.parallel'
                  )
                }}
              </span>
              <span class="leading-snug">
                {{
                  $t(
                    isSequential
                      ? 'documentPage.signature.approval.modeSequentialHint'
                      : 'documentPage.signature.approval.modeParallelHint'
                  )
                }}
              </span>
            </div>
            <template v-for="(row, i) in rows" :key="row.item.id ?? row.idx">
              <div
                v-if="i === firstViewerIdx"
                class="mt-1 mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-textColor3"
              >
                {{ $t('documentPage.signature.approval.viewers') }}
              </div>
              <SignerCard
                :item="row.item"
                :is-last="i === rows.length - 1 || i + 1 === firstViewerIdx"
                :is-self="isSelf(row.item)"
                :events="history.bySigner[row.idx] || []"
                :step="stepOf.get(row.item) ?? null"
                :current="isCurrent(row.item)"
                :waiting="isWaiting(row.item)"
                :can-link="canLink(row.item)"
                :link-disabled="isWaiting(row.item)"
                :link-loading="store.linkLoading"
                @link="generateLink"
                @chat="onOpenChat"
              />
            </template>
          </div>

          <ApprovalHistory
            v-else
            :confirmations="store.confirmations"
            :by-signer="history.bySigner"
            :document-events="store.document?.document_events || []"
          />
        </div>
      </Transition>
    </div>

    <!-- Havola oynasi ixcham: hamma tomondan bir xil 16px chekka, ortiqcha bo'shliq yo'q.
         Havola bitta qatorda, sig'masa «…» bilan kesiladi (to'liq matn tooltip'da,
         nusxalash baribir butun havolani oladi) -->
    <n-modal v-model:show="store.linkVisible">
      <n-card
        :bordered="false"
        role="dialog"
        aria-modal="true"
        style="width: min(360px, calc(100vw - 32px))"
        content-style="padding: 16px"
      >
        <n-spin :show="store.linkLoading">
          <span
            class="block text-sm select-none text-center uppercase font-semibold text-primary"
          >{{ $t('signature.linkText') }}</span>
          <span
            class="block mt-3 text-xs truncate border border-surface-line bg-surface-ground text-textColor2 border-dashed px-2.5 py-2 rounded-md"
            :class="{ 'line-through opacity-50': linkExpired }"
            :title="store.link"
          >{{ store.link }}</span>
          <div v-if="store.link" class="mt-2 text-center text-xs">
            <span v-if="!linkExpired" class="text-textColor2">
              {{ $t('signature.linkExpiresIn', { time: linkLeftText }) }}
            </span>
            <span v-else class="text-danger font-medium">{{ $t('signature.linkExpired') }}</span>
          </div>
        </n-spin>
        <div class="grid grid-cols-2 gap-2 mt-4 select-none">
          <n-button
            :loading="store.linkLoading"
            @click="store.linkVisible = false"
            secondary
            size="small"
            type="error"
          >
            {{ $t('content.close') }}
          </n-button>
          <n-button
            v-if="linkExpired"
            :loading="store.linkLoading"
            @click="store._generateLink(store.linkPayload)"
            secondary
            size="small"
            type="primary"
          >
            {{ $t('signature.newLink') }}
          </n-button>
          <n-button
            v-else
            :loading="store.linkLoading"
            @click="copyLink"
            secondary
            size="small"
            type="primary"
          >
            <template #icon>
              <Copy20Regular />
            </template>
            {{ $t('signature.copyLink') }}
          </n-button>
        </div>
      </n-card>
    </n-modal>
  </SectionHeader>
</template>

<style scoped>
  /*
    Ikkala ko'rinish bitta grid katagida ustma-ust turadi: eskisi chiqib
    ketayotganda yangisi yonidan kirib keladi (`mode="out-in"` siz) — xuddi
    telefondagi "push" navigatsiyasidek, butun panel kengligida surilish ko'rinadi.
  */
  /* `minmax(0, 1fr)`: ustun panel kengligidan oshmasin. Oddiy `auto` ustun
     kontentning (uzun ism, tugmalar) kengligigacha cho'zilib, kartalarni
     o'ngdan kesib qo'yardi. */
  .slide-stage {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }

  .slide-pane {
    grid-area: 1 / 1;
    min-width: 0;
  }

  .slide-forward-enter-active,
  .slide-forward-leave-active,
  .slide-back-enter-active,
  .slide-back-leave-active {
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .slide-forward-enter-from,
  .slide-back-leave-to {
    transform: translateX(100%);
  }

  .slide-forward-leave-to,
  .slide-back-enter-from {
    transform: translateX(-100%);
  }

  @media (prefers-reduced-motion: reduce) {
    .slide-forward-enter-active,
    .slide-forward-leave-active,
    .slide-back-enter-active,
    .slide-back-leave-active {
      transition: none;
    }
  }
</style>
