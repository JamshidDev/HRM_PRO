<script setup>
  import { Search24Regular, Compose20Regular } from '@vicons/fluent'
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

  // Ro'yxat filtri: barchasi / faqat o'qilmaganlar. Qadalganlar alohida bo'limda.
  const filter = ref('all')
  const unreadChats = computed(() => props.chat.userList.value.filter((u) => u.unreadCount > 0))
  const visibleList = computed(() => (filter.value === 'unread' ? unreadChats.value : props.chat.userList.value))
  const pinnedList = computed(() => visibleList.value.filter((u) => u.pinned))
  const otherList = computed(() => visibleList.value.filter((u) => !u.pinned))
  // Bo'lim sarlavhalari faqat qadalgan suhbat bo'lsa (aks holda ortiqcha shovqin).
  const showSections = computed(() => pinnedList.value.length > 0)

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
    <div class="flex shrink-0 items-center justify-between gap-2 px-2 pt-1 pb-3">
      <h2 class="text-lg font-bold text-textColor0">{{ $t('liveChatPage.chats') }}</h2>
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button circle type="primary" secondary @click="openNewChat">
            <template #icon>
              <n-icon size="18"><Compose20Regular /></n-icon>
            </template>
          </n-button>
        </template>
        {{ $t('liveChatPage.newChat') }}
      </n-tooltip>
    </div>

    <div class="shrink-0 px-1">
      <n-input
        :value="chat.search.value"
        clearable
        class="chat-search"
        :placeholder="$t('liveChatPage.searchPlaceholder')"
        @update:value="chat.setSearch"
      >
        <template #prefix>
          <n-icon size="18" class="text-textColor3"><Search24Regular /></n-icon>
        </template>
      </n-input>
    </div>

    <div class="flex shrink-0 items-center gap-1.5 px-1 pt-2.5 pb-1">
      <button
        v-for="tab in ['all', 'unread']"
        :key="tab"
        type="button"
        class="flex items-center gap-1 rounded-full border px-3 py-1 text-[13px] transition-colors"
        :class="
          filter === tab
            ? 'border-primary bg-primary text-white'
            : 'border-surface-line text-textColor1 hover:border-primary hover:text-primary'
        "
        @click="filter = tab"
      >
        {{ $t(`liveChatPage.${tab}`) }}
        <span v-if="tab === 'unread' && unreadChats.length" class="font-semibold opacity-90">{{ unreadChats.length }}</span>
      </button>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto px-1">
      <template v-if="chat.listLoading.value && !chat.userList.value.length">
        <div v-for="i in 6" :key="i" class="flex items-center gap-3 px-3 py-2.5">
          <n-skeleton circle :width="42" :height="42" />
          <div class="flex-1">
            <n-skeleton text style="width: 60%" />
            <n-skeleton text style="width: 85%" />
          </div>
        </div>
      </template>
      <template v-else>
        <template v-for="section in showSections ? ['pinned', 'other'] : ['other']" :key="section">
          <div
            v-if="showSections && (section === 'pinned' ? pinnedList : otherList).length"
            class="px-3 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-textColor3"
          >
            {{ section === 'pinned' ? $t('liveChatPage.pinnedChats') : $t('liveChatPage.allChats') }}
          </div>
          <TransitionGroup name="chat-list" tag="div" class="relative">
            <ChatUserItem
              v-for="user in section === 'pinned' ? pinnedList : otherList"
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
      </template>
      <div
        v-if="!chat.listLoading.value && chat.userList.value.length && !visibleList.length"
        class="py-10 text-center text-sm text-textColor3"
      >
        {{ $t('liveChatPage.noUnread') }}
      </div>
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
  .chat-list-move {
    transition: transform 0.25s ease;
  }
  /* Qidiruv — fonli, chegarasiz (fokusda primary chegara) */
  .chat-search {
    --n-color: var(--surface-ground) !important;
    --n-border: 1px solid transparent !important;
    --n-border-hover: 1px solid var(--surface-line) !important;
    --n-height: 40px !important;
    --n-border-radius: 12px !important;
  }
</style>
