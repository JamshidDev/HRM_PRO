<script setup>
  import { UIPageContent } from '@components'
  import { ChatSidebar, ChatWindow, EmptyState } from './ui'
  import { useLiveChat } from './ui/useLiveChat.js'
  import { useLiveChatStore } from '@/store/modules/chat/liveChatStore.js'

  const chat = useLiveChat()
  const store = useLiveChatStore()

  const onContextMenu = (e) => {
    if (!e.target.closest('textarea, input, [contenteditable="true"]')) e.preventDefault()
  }

  onMounted(() => {
    store.init()
    store.loadConversations()
    if (store.selectedId) store.markRead(store.selectedId)
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

        <div class="min-w-0 flex-1 rounded-[20px] border border-surface-line/50 bg-surface-section p-3 md:min-h-0">
          <ChatWindow v-if="chat.selectedUserId.value" :chat="chat" />
          <EmptyState v-else />
        </div>
      </div>
    </UIPageContent>
  </div>
</template>
