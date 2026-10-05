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
  import { buildApprovalHistory } from '../utils/approvalHistory.js'
  const { t } = i18.global

  const store = usePdfViewerStore()
  const accountStore = useAccountStore()
  const route = useRoute()

  const isSelf = (item) => item.worker?.id === accountStore.account?.worker?.id

  const chatWith = ref(null)
  const activeTab = ref('signers')

  // Tarix FAQAT backenddan keladi (`confirmations[].histories`).
  const history = computed(() => buildApprovalHistory(store.confirmations))

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

        <div v-else class="slide-pane">
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
            :document-events="store.document?.document_events || []"
          />
        </div>
      </Transition>
    </div>

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
