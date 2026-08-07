<script setup>
  import { ArrowMinimize24Regular, Dismiss24Regular } from '@vicons/fluent'
  import { useAIConversationStore } from '@/store/modules/index.js'
  import Keyboard from './Keyboard.vue'
  import Message from './Message.vue'
  import Disclaimer from './Disclaimer.vue'
  import Panel from './Panel.vue'
  import SuggestionChips from './SuggestionChips.vue'
  import aiAssistantIcon from '@/assets/images/content/ai-assistant.svg?url'
  import aiConversationBg from '@/assets/images/svg/AIconBG.svg?raw'

  const aiConversationBgFill = aiConversationBg.replace(
    '<svg ',
    '<svg preserveAspectRatio="xMidYMax meet" '
  )

  defineProps({
    showPanel: {
      type: Boolean,
      default: true
    }
  })

  const store = useAIConversationStore()
  const router = useRouter()

  const backToModal = () => {
    router.back()
    store.openModal()
  }

  const closePage = () => {
    router.back()
  }
  const chatContainer = ref(null)

  watch(
    () => store.messages,
    async () => {
      await nextTick()
      const el = chatContainer.value
      if (!el || store.historyMode) return
    },
    { deep: true }
  )

  const containerScrollEv = () => {
    const container = chatContainer.value
    store.scrollContainer = container
    container.addEventListener('scroll', () => {
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      store.scrollHeight = scrollHeight
      if (
        scrollTop === 0 &&
        !store.questionLoading &&
        store.totalQuestion > store.messages.length
      ) {
        store.questionParams.page++
        store.questions(true)
      }
    })
  }

  onMounted(() => {
    containerScrollEv()
    store.questionParams.date = store.today
    store.questions()
  })

  onUnmounted(() => {
    store.controller?.abort()
  })
</script>

<template>
  <div class="w-full h-full flex">
    <div
      v-if="showPanel"
      class="hidden md:block w-[280px] h-full shrink-0 overflow-hidden bg-surface-section border-r border-surface-line"
    >
      <Panel />
    </div>

    <div
      class="flex flex-col h-full flex-1 min-w-0 relative isolate"
      :class="showPanel ? 'bg-surface-ground py-6' : 'bg-surface-section'"
    >
      <div
        v-if="showPanel"
        class="ai-page-bg absolute inset-0 -z-10 pointer-events-none overflow-hidden"
        aria-hidden="true"
        v-html="aiConversationBgFill"
      ></div>
      <div v-if="showPanel" class="page-header w-full flex justify-center shrink-0">
        <div class="w-full max-w-[1000px] flex items-center justify-between px-5 py-3">
          <div class="flex items-center gap-2 min-w-0">
            <img
              :src="aiAssistantIcon"
              alt=""
              class="w-9 h-9 rounded-full object-cover select-none shrink-0"
              draggable="false"
            />
            <span class="text-lg sm:text-xl font-semibold text-primary truncate">
              {{ $t('aiConversation.aiAssistant') }}
            </span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <div
              @click="backToModal"
              class="page-header-btn w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-colors"
            >
              <n-icon size="20" class="text-textColor2">
                <ArrowMinimize24Regular />
              </n-icon>
            </div>
            <div
              @click="closePage"
              class="page-header-btn w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-colors"
            >
              <n-icon size="20" class="text-textColor2">
                <Dismiss24Regular />
              </n-icon>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full max-w-[1200px] relative flex-1 min-h-0 flex flex-col mx-auto">
        <div
          ref="chatContainer"
          class="scroll-container w-full max-w-[800px] mx-auto relative flex flex-col overflow-y-auto overflow-x-hidden pt-6 overscroll-none flex-1 min-h-0"
          :class="showPanel ? 'pb-24' : 'pb-28'"
        >
          <Disclaimer :show-panel="showPanel" />
          <n-spin :show="store.questionLoading" class="w-full">
            <template v-for="message in store.messages" :key="message.key">
              <Message :data="message" />
            </template>
            <span class="block w-full h-[40px]"></span>
          </n-spin>
        </div>

        <div
          class="absolute bottom-2 flex flex-col items-center gap-4"
          :class="showPanel ? 'left-0 right-0' : 'left-4 right-4'"
        >
          <SuggestionChips v-if="store.messages.length === 0" :show-panel="showPanel" />
          <Keyboard :show-panel="showPanel" class="w-full max-w-[800px]" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  :deep(.scroll-container) {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  :deep(.scroll-container::-webkit-scrollbar) {
    display: none;
  }

  .page-header-btn {
    background: var(--surface-line);
  }
  .page-header-btn:hover {
    filter: brightness(0.92);
  }

  .ai-page-bg :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .ai-page-bg :deep(svg g) {
    opacity: 0.04;
    transition: opacity 0.25s ease;
  }

  [data-theme='dark'] .ai-page-bg :deep(svg g) {
    opacity: 0.1;
  }
</style>
