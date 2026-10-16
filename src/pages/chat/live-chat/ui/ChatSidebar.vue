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
    <div class="flex shrink-0 items-center gap-2 px-1 pb-3">
      <n-input
        :value="chat.search.value"
        clearable
        round
        size="large"
        :placeholder="$t('liveChatPage.searchPlaceholder')"
        @update:value="chat.setSearch"
      >
        <template #prefix>
          <n-icon size="18" class="text-textColor3"><Search24Regular /></n-icon>
        </template>
      </n-input>
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button circle type="primary" secondary size="large" @click="openNewChat">
            <template #icon>
              <n-icon size="20"><Compose20Regular /></n-icon>
            </template>
          </n-button>
        </template>
        {{ $t('liveChatPage.newChat') }}
      </n-tooltip>
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
      <TransitionGroup v-else name="chat-list" tag="div" class="relative">
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
</style>
