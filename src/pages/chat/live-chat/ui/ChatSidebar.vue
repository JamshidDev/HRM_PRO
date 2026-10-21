<script setup>
  import { Search24Regular, Compose20Regular, Dismiss20Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import { UIDeleteConfirm } from '@/components/index.js'
  import ChatUserItem from './ChatUserItem.vue'
  import NewChatModal from './NewChatModal.vue'

  const { t } = i18n.global

  const props = defineProps({
    chat: { type: Object, required: true }
  })

  // Tarixni tozalash/suhbatni o'chirish uchun bitta umumiy tasdiq modali.
  const confirmVisible = ref(false)
  const pendingAction = ref(null)

  const askConfirm = (warning, run) => {
    pendingAction.value = { warning, run }
    confirmVisible.value = true
  }

  const confirmClearHistory = (user) => {
    askConfirm(t('liveChatPage.clearHistoryConfirm', { name: user.fullName }), () =>
      props.chat.clearHistory(user.id)
    )
  }

  const confirmDeleteChat = (user) => {
    askConfirm(t('liveChatPage.deleteChatConfirm', { name: user.fullName }), () =>
      props.chat.deleteChat(user.id)
    )
  }

  const onConfirm = () => {
    confirmVisible.value = false
    pendingAction.value?.run()
    pendingAction.value = null
  }


  // Ro'yxat ichidan qidirish — 🔍 bosilganda sarlavha o'rnida ochiladi; yopilganda qidiruv tozalanadi.
  const searchOpen = ref(!!props.chat.search.value)
  const searchInputRef = ref(null)
  const openSearch = () => {
    searchOpen.value = true
    // mode="out-in": input sarlavha chiqib bo'lgach paydo bo'ladi
    setTimeout(() => searchInputRef.value?.focus(), 180)
  }
  const closeSearch = () => {
    searchOpen.value = false
    if (props.chat.search.value) props.chat.setSearch('')
  }

  const showNewChat = ref(false)
  // Modal yopilganda fokus tugmaga qaytmasin (aks holda Space modalni qayta ochadi).
  const openNewChat = (e) => {
    e?.currentTarget?.blur?.()
    showNewChat.value = true
  }
  const onPickUser = (user) => {
    showNewChat.value = false
    props.chat.openWithUser(user)
  }
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Sarlavha qatori: 🔍 — o'z suhbatlarim ichidan qidirish (sarlavha o'rnida input chiqadi),
         ✏️ — butun tashkilot bo'yicha xodim qidirib, yangi suhbat ochish -->
    <div class="flex h-9 shrink-0 items-center gap-1 pl-4 pr-3 mb-1.5">
      <Transition name="head-swap" mode="out-in">
        <h2 v-if="!searchOpen" key="title" class="min-w-0 flex-1 truncate text-lg font-bold text-textColor0">
          {{ $t('liveChatPage.chats') }}
        </h2>
        <n-input
          v-else
          key="search"
          ref="searchInputRef"
          :value="chat.search.value"
          class="chat-search min-w-0 flex-1"
          :placeholder="$t('liveChatPage.searchPlaceholder')"
          @update:value="chat.setSearch"
          @keydown.esc.stop="closeSearch"
        />
      </Transition>

      <n-tooltip trigger="hover">
        <template #trigger>
          <button
            type="button"
            class="head-icon"
            :aria-label="searchOpen ? $t('liveChatPage.closeSearch') : $t('liveChatPage.searchChats')"
            @click="searchOpen ? closeSearch() : openSearch()"
          >
            <n-icon size="20">
              <Dismiss20Regular v-if="searchOpen" />
              <Search24Regular v-else />
            </n-icon>
          </button>
        </template>
        {{ searchOpen ? $t('liveChatPage.closeSearch') : $t('liveChatPage.searchChats') }}
      </n-tooltip>
      <n-tooltip trigger="hover">
        <template #trigger>
          <button type="button" class="head-icon" :aria-label="$t('liveChatPage.newChat')" @click="openNewChat">
            <n-icon size="20"><Compose20Regular /></n-icon>
          </button>
        </template>
        {{ $t('liveChatPage.newChat') }}
      </n-tooltip>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto pt-2 pb-2">
      <template v-if="chat.listLoading.value && !chat.userList.value.length">
        <div v-for="i in 6" :key="i" class="flex items-center gap-3 px-4 py-2">
          <n-skeleton circle :width="40" :height="40" />
          <div class="flex-1">
            <n-skeleton text style="width: 60%" />
            <n-skeleton text style="width: 85%" />
          </div>
        </div>
      </template>
      <template v-else>
        <!-- Bitta ro'yxat: qadalganlar store'da tepaga saralangan, bo'lim sarlavhalari yo'q (Telegram kabi) -->
        <TransitionGroup name="chat-list" tag="div" class="relative">
          <ChatUserItem
            v-for="user in chat.userList.value"
            :key="user.id"
            :user="user"
            :me-id="chat.meId.value"
            :typing="chat.isTyping(user.id)"
            :active="user.id === chat.selectedUserId.value"
            @click="chat.selectUser(user.id)"
            @pin="chat.togglePinChat(user.id)"
            @clear="confirmClearHistory(user)"
            @delete="confirmDeleteChat(user)"
          />
        </TransitionGroup>
      </template>
      <div
        v-if="!chat.listLoading.value && !chat.userList.value.length"
        class="flex flex-col items-center gap-3 py-10 text-center text-sm text-textColor3"
      >
        <span>{{ chat.search.value ? $t('liveChatPage.noUsers') : $t('liveChatPage.noChats') }}</span>
        <n-button size="small" type="primary" secondary @click="openNewChat">
          {{ $t('liveChatPage.newChat') }}
        </n-button>
      </div>
    </div>

    <UIDeleteConfirm
      v-model:visible="confirmVisible"
      :warning="pendingAction?.warning"
      @confirm="onConfirm"
    />
    <NewChatModal v-model:show="showNewChat" :chat="chat" @pick="onPickUser" />
  </div>
</template>

<style scoped>
  /* Suhbatlar ro'yxati: joy almashish, yangi suhbat kirishi, o'chirilgan suhbat chiqishi */
  .chat-list-move {
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .chat-list-enter-active {
    transition:
      opacity 0.28s ease,
      transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .chat-list-leave-active {
    position: absolute;
    left: 0;
    right: 0;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
  .chat-list-enter-from {
    opacity: 0;
    transform: translateX(-12px);
  }
  .chat-list-leave-to {
    opacity: 0;
    transform: translateX(12px);
  }
  /* Qidiruv — fonli, chegarasiz (fokusda primary chegara) */
  .chat-search {
    --n-color: var(--surface-ground) !important;
    --n-border: 1px solid transparent !important;
    --n-border-hover: 1px solid var(--surface-line) !important;
    --n-height: 34px !important;
    --n-border-radius: 10px !important;
  }
  /* Sarlavhadagi ikonalar — doirasiz/fonsiz, faqat rang o'zgaradi */
  .head-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--textColor3);
    transition: color 0.2s ease;
  }
  .head-icon:hover,
  .head-icon:focus-visible {
    color: var(--primary-color);
  }
  /* Sarlavha ↔ qidiruv maydoni almashuvi */
  .head-swap-enter-active,
  .head-swap-leave-active {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }
  .head-swap-enter-from,
  .head-swap-leave-to {
    opacity: 0;
    transform: translateX(-6px);
  }
</style>
