<script setup>
  import { UIPageContent } from '@components'
  import { ChatSidebar, ChatWindow, EmptyState } from './ui'
  import { useLiveChat } from './ui/useLiveChat.js'
  import { useLiveChatStore } from '@/store/modules/chat/liveChatStore.js'
  import { useAppBreakpoints } from '@/composables/useBreakpoint.js'

  const chat = useLiveChat()
  const store = useLiveChatStore()
  const { isMobile } = useAppBreakpoints()

  // Mobil: avval faqat ro'yxat; suhbat tanlansa — butun ekranli oyna (Telegram kabi).
  const mobileChatOpen = computed(() => isMobile.value && !!chat.selectedUserId.value)

  const onContextMenu = (e) => {
    if (!e.target.closest('textarea, input, [contenteditable="true"]')) e.preventDefault()
  }

  // Telefonning "orqaga" tugmasi sahifadan chiqib ketmasin — avval suhbatni yopsin.
  // Joriy URL o'zgarmaydi; router holati (history.state) saqlab qolinadi.
  let historyPushed = false
  watch(mobileChatOpen, (open) => {
    if (open && !historyPushed) {
      history.pushState({ ...history.state, liveChatOpen: true }, '')
      historyPushed = true
    } else if (!open && historyPushed) {
      historyPushed = false
      if (history.state?.liveChatOpen) history.back()
    }
  })
  const onPopState = () => {
    if (!historyPushed || history.state?.liveChatOpen) return
    historyPushed = false
    chat.closeChat()
  }

  onMounted(() => {
    store.init()
    store.loadConversations()
    if (store.selectedId) store.markRead(store.selectedId)
    window.addEventListener('popstate', onPopState)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', onPopState)
    // Mobilda sahifaga qaytilganda avval ro'yxat ko'rinsin. `historyPushed` oldin o'chiriladi —
    // aks holda watch `history.back()` qilib, hozirgi o'tishni bekor qilib yuborishi mumkin.
    historyPushed = false
    if (isMobile.value) chat.closeChat()
  })
</script>

<template>
  <div class="!h-full" @contextmenu="onContextMenu">
    <!-- Brauzer kontekst menyusi o'chirilgan (o'ng klik — xabar/suhbat menyusi); matn maydonlarida qoladi. -->
    <UIPageContent class="!h-full">
      <div class="flex flex-col gap-4 md:min-h-0 md:flex-1 md:flex-row">
        <div
          class="rounded-[20px] border border-surface-line/50 bg-surface-section p-3 md:min-h-0 md:w-[320px] md:shrink-0 xl:w-[360px]"
        >
          <ChatSidebar :chat="chat" />
        </div>

        <!-- Mobilda suhbat body'ga ko'chiriladi: header/sidebar ustida butun ekranni egallaydi. -->
        <Teleport to="body" :disabled="!isMobile">
          <Transition :name="isMobile ? 'chat-slide' : ''">
            <div
              v-if="!isMobile || mobileChatOpen"
              :class="
                isMobile
                  ? 'live-chat-mobile fixed inset-x-0 top-0 z-[95] flex flex-col bg-surface-section px-2 pt-2'
                  : 'min-w-0 flex-1 rounded-[20px] border border-surface-line/50 bg-surface-section p-3 md:min-h-0'
              "
            >
              <ChatWindow
                v-if="chat.selectedUserId.value"
                :chat="chat"
                :mobile="isMobile"
                class="min-h-0 flex-1"
                @back="chat.closeChat"
              />
              <EmptyState v-else />
            </div>
          </Transition>
        </Teleport>
      </div>
    </UIPageContent>
  </div>
</template>

<style scoped>
  /* `svh` emas `dvh`: klaviatura/manzil paneli o'zgarganda kiritish maydoni ko'rinib tursin. */
  .live-chat-mobile {
    height: 100dvh;
    padding-bottom: max(8px, env(safe-area-inset-bottom));
  }
  .chat-slide-enter-active,
  .chat-slide-leave-active {
    transition:
      transform 0.25s ease,
      opacity 0.25s ease;
  }
  .chat-slide-enter-from,
  .chat-slide-leave-to {
    transform: translateX(24%);
    opacity: 0;
  }
</style>
