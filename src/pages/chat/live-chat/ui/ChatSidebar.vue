<script setup>
  import { Search24Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import { UIDeleteConfirm } from '@/components/index.js'
  import ChatUserItem from './ChatUserItem.vue'

  const { t } = i18n.global

  const props = defineProps({
    chat: { type: Object, required: true }
  })

  // Tarixni tozalash/suhbatni o'chirish — butun ro'yxatga ta'sir qiladigan
  // og'ir amallar, shuning uchun bosishdan oldin tasdiqlanadi. Ikkala amal
  // uchun bitta umumiy tasdiq modali: qaysi amal kutilayotgani shu yerda.
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
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="shrink-0 px-1 pb-3">
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
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto px-1">
      <ChatUserItem
        v-for="user in chat.userList.value"
        :key="user.id"
        :user="user"
        :active="user.id === chat.selectedUserId.value"
        @click="chat.selectUser(user.id)"
        @pin="chat.togglePinChat(user.id)"
        @clear="confirmClearHistory(user)"
        @delete="confirmDeleteChat(user)"
      />

      <div v-if="!chat.userList.value.length" class="py-10 text-center text-sm text-textColor3">
        {{ $t('liveChatPage.noUsers') }}
      </div>
    </div>

    <UIDeleteConfirm
      v-model:visible="confirmVisible"
      :warning="pendingAction?.warning"
      @confirm="onConfirm"
    />
  </div>
</template>
