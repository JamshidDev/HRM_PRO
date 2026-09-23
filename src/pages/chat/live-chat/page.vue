<script setup>
  import { UIPageContent } from '@components'
  import { ChatSidebar, ChatWindow, EmptyState } from './ui'
  import { useLiveChat } from './ui/useLiveChat.js'

  const chat = useLiveChat()
</script>

<template>
  <!-- Butun sahifada standart brauzer kontekst menyusi o'chirilgan — bu yerda
       o'ng klik faqat xabar/suhbat amallar menyusini ochish uchun ishlatiladi
       (bo'sh joyda esa hech narsa qilmaydi, faqat brauzer menyusini bloklaydi). -->
  <div class="!h-full" @contextmenu.prevent>
    <UIPageContent class="!h-full">
      <div class="grid grid-cols-12 gap-4 md:min-h-0 md:flex-1">
        <div
          class="col-span-12 rounded-[20px] border border-surface-line/50 bg-surface-section p-3 md:col-span-4 md:min-h-0 lg:col-span-3"
        >
          <ChatSidebar :chat="chat" />
        </div>

        <div
          class="col-span-12 rounded-[20px] border border-surface-line/50 bg-surface-section p-3 md:col-span-8 md:min-h-0 lg:col-span-9"
        >
          <ChatWindow v-if="chat.selectedUserId.value" :chat="chat" />
          <EmptyState v-else />
        </div>
      </div>
    </UIPageContent>
  </div>
</template>
