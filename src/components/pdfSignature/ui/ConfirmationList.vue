<script setup>
  import { UIDConfirm } from '@/components/index.js'
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

  const history = computed(() =>
    buildApprovalHistory(store.confirmations, store.document?.document?.created)
  )

  const summary = computed(() => {
    const list = store.confirmations || []
    const approved = list.filter((v) => v.status?.id === STATUS.success).length
    const rejected = list.filter((v) => v.status?.id === STATUS.rejected).length
    const total = list.length
    return {
      total,
      approved,
      rejected,
      pending: total - approved - rejected,
      percent: total ? Math.round((approved / total) * 100) : 0
    }
  })

  const summaryTone = computed(() => {
    if (summary.value.rejected) return 'text-fig-text-red'
    if (summary.value.total && summary.value.approved === summary.value.total)
      return 'text-fig-chip-green-text'
    return 'text-fig-chip-amber-text'
  })

  const segmentClass = (statusId) => {
    if (statusId === STATUS.success) return 'bg-fig-success'
    if (statusId === STATUS.rejected) return 'bg-fig-red'
    if (statusId === STATUS.read) return 'bg-fig-blue-300'
    return 'bg-surface-line'
  }

  const generateLink = (v) => {
    if (v.type === 'w') {
      let data = {
        confirmation_id: v.id,
        model: store.model
      }
      store._generateLink(data)
    }
  }

  const copyLink = () => {
    Utils.copyToClipboard(store.link, () => {
      $Toast.info(t('signature.copied'))
    })
  }

  const isDocFlow = computed(() => {
    return !route.fullPath.includes(AppPaths.DocFlow)
  })

  const onOpenChat = (item) => {
    chatWith.value = item
  }

  const onCloseChat = () => {
    chatWith.value = null
    store.payload.recipient_id = null
  }
</script>

<template>
  <SectionHeader full-height tight-body>
    <template #header>
      <div v-if="chatWith" class="flex items-center gap-2 min-w-0">
        <n-button quaternary circle size="small" @click="onCloseChat">
          <template #icon>
            <n-icon size="18">
              <ArrowLeft20Filled />
            </n-icon>
          </template>
        </n-button>
        <span class="font-semibold text-textColor0 truncate">
          {{ chatWith.worker.last_name }} {{ chatWith.worker.first_name }}
        </span>
      </div>
      <div v-else class="flex items-center justify-between gap-2 min-w-0 w-full">
        <div class="flex items-center gap-2 min-w-0">
          <span class="font-semibold text-textColor0 truncate">{{ $t('documentPage.signature.approval.title') }}</span>
          <n-badge v-if="store.document?.chats" :value="store.document.chats" :max="99" />
        </div>
        <span class="text-xs font-semibold tabular-nums text-textColor2 shrink-0">
          {{ summary.approved }}/{{ summary.total }}
        </span>
      </div>
    </template>

    <ChatCotent v-if="chatWith" :forced-recipient-worker-id="chatWith.worker.id" />

    <template v-else>
      <!-- Umumiy holat: segmentli progress va hisoblagichlar -->
      <div class="rounded-xl border border-surface-line bg-surface-ground/50 p-3 mb-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-textColor2">
            {{ $t('documentPage.signature.approval.progress', { done: summary.approved, total: summary.total }) }}
          </span>
          <span class="text-xs font-semibold tabular-nums" :class="summaryTone">{{ summary.percent }}%</span>
        </div>
        <div class="flex gap-1">
          <div
            v-for="(item, idx) in store.confirmations"
            :key="idx"
            class="h-1.5 flex-1 rounded-full"
            :class="segmentClass(item.status?.id)"
          ></div>
        </div>
        <div class="grid grid-cols-3 gap-2 mt-3">
          <div class="rounded-lg bg-surface-section px-2 py-1.5">
            <div class="text-sm font-semibold tabular-nums text-fig-chip-green-text">{{ summary.approved }}</div>
            <div class="text-[10px] text-textColor3">{{ $t('documentPage.signature.approval.summary.approved') }}</div>
          </div>
          <div class="rounded-lg bg-surface-section px-2 py-1.5">
            <div class="text-sm font-semibold tabular-nums text-fig-text-red">{{ summary.rejected }}</div>
            <div class="text-[10px] text-textColor3">{{ $t('documentPage.signature.approval.summary.rejected') }}</div>
          </div>
          <div class="rounded-lg bg-surface-section px-2 py-1.5">
            <div class="text-sm font-semibold tabular-nums text-fig-chip-amber-text">{{ summary.pending }}</div>
            <div class="text-[10px] text-textColor3">{{ $t('documentPage.signature.approval.summary.pending') }}</div>
          </div>
        </div>
      </div>

      <n-tabs v-model:value="activeTab" type="segment" size="small" animated class="mb-3">
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
      </n-tabs>

      <div v-if="activeTab === 'signers'">
        <SignerCard
          v-for="(item, idx) in store.confirmations"
          :key="item.id ?? idx"
          :item="item"
          :step="idx + 1"
          :is-last="idx === store.confirmations.length - 1"
          :is-self="isSelf(item)"
          :events="history.bySigner[idx] || []"
          :can-link="item.type === 'w' && isDocFlow && item.status?.id !== 3 && !store.viewerLoading"
          :link-loading="store.linkLoading"
          @link="generateLink"
          @chat="onOpenChat"
        />
      </div>

      <ApprovalHistory
        v-else
        :confirmations="store.confirmations"
        :by-signer="history.bySigner"
        :is-mock="history.isMock"
      />
    </template>

    <UIDConfirm v-model:visible="store.linkVisible" type="warning">
      <template #icon> <span></span></template>
      <n-spin :show="store.linkLoading">
        <div class="mt-4">
          <span
            class="block text-lg select-none text-center uppercase font-semibold text-primary mb-6"
          >{{ $t('signature.linkText') }}</span>
          <span
            class="block text-sm border border-surface-line bg-surface-ground text-textColor2 border-dashed p-3 mt-4 rounded-md"
          >{{ store.link }}</span>
        </div>
      </n-spin>
      <template #action>
        <div class="grid grid-cols-2 gap-2 select-none">
          <n-button
            :loading="store.linkLoading"
            @click="store.linkVisible = false"
            secondary
            type="error"
          >
            {{ $t('content.close') }}
          </n-button>
          <n-button :loading="store.linkLoading" @click="copyLink" secondary type="primary">
            <template #icon>
              <Copy20Regular />
            </template>
            {{ $t('signature.copyLink') }}
          </n-button>
        </div>
      </template>
    </UIDConfirm>
  </SectionHeader>
</template>

<style scoped></style>
