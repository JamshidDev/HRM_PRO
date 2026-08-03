<script setup>
  import { useAIConversationStore } from '@/store/modules/index.js'
  import Keyboard from './Keyboard.vue'
  import Message from './Message.vue'
  import Disclaimer from './Disclaimer.vue'
  import Panel from './Panel.vue'

  const store = useAIConversationStore()
  const chatContainer = ref(null)
  const scrollToBottom = (el) => {
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth'
    })
  }

  watch(
    () => store.messages,
    async (async) => {
      await nextTick()
      const el = chatContainer.value
      if (!el || store.historyMode) return
      // scrollToBottom(el)
    },
    { deep: true }
  )

  const containerScrollEv = () => {
    const container = chatContainer.value
    store.scrollContainer = container
    // Scroll event listener
    container.addEventListener('scroll', () => {
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      store.scrollHeight = scrollHeight
      if (
        scrollTop === 0 &&
        !store.questionLoading &&
        store.totalQuestion > store.messages.length
      ) {
        store.questionParams.page++
        store.questions(true)
      }

      // Check if it's at the bottom
      // if (scrollTop + clientHeight === scrollHeight) {
      // }
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
  <div class="w-full h-full flex bg-surface-ground">
    <div class="flex flex-col h-full px-4" style="width: calc(100% - 260px)">
      <div class="mx-auto w-full max-w-[1200px] relative px-8 flex-1 min-h-0 flex flex-col">
        <div
          ref="chatContainer"
          class="mx-auto scroll-container w-full relative flex flex-col overflow-y-scroll overflow-x-hidden pt-6 overscroll-none flex-1 min-h-0"
        >
          <Disclaimer />
          <n-spin :show="store.questionLoading" class="w-full">
            <template v-for="message in store.messages" :key="message.key">
              <Message :data="message" />
            </template>
            <span class="block w-full h-[40px]"></span>
          </n-spin>
        </div>
        <Keyboard
          style="transform: translateX(-50%); left: 50%"
          class="absolute bottom-2 w-full max-w-[800px]"
        />
      </div>
    </div>

    <div class="w-[260px] h-full overflow-hidden bg-white border-l border-surface-line">
      <Panel />
    </div>
  </div>
</template>

<style scoped lang="scss">
  :deep(.scroll-container::-webkit-scrollbar) {
    width: 6px;
  }

  :deep(.scroll-container::-webkit-scrollbar-track) {
    background: transparent;
  }

  :deep(.scroll-container::-webkit-scrollbar-thumb) {
    background-color: transparent;
    border-radius: 10px;
  }
  :deep(.scroll-container::-webkit-scrollbar-thumb:hover) {
    background-color: #cad5e3;
  }
</style>
