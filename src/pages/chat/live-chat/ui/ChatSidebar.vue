<script setup>
  import { useDialog } from 'naive-ui'
  import { Search24Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import ChatUserItem from './ChatUserItem.vue'

  const { t } = i18n.global
  const dialog = useDialog()

  const props = defineProps({
    chat: { type: Object, required: true }
  })

  // Tarixni tozalash/suhbatni o'chirish — butun ro'yxatga ta'sir qiladigan
  // og'ir amallar, shuning uchun bosishdan oldin tasdiqlanadi (bitta xabarni
  // o'chirishdan farqli, u yerda ta'sir ko'lami kichik).
  const confirmClearHistory = (user) => {
    dialog.warning({
      title: t('liveChatPage.clearHistory'),
      content: t('liveChatPage.clearHistoryConfirm', { name: user.fullName }),
      positiveText: t('content.yes'),
      negativeText: t('content.no'),
      onPositiveClick: () => props.chat.clearHistory(user.id)
    })
  }

  const confirmDeleteChat = (user) => {
    dialog.warning({
      title: t('liveChatPage.deleteChat'),
      content: t('liveChatPage.deleteChatConfirm', { name: user.fullName }),
      positiveText: t('content.yes'),
      negativeText: t('content.no'),
      onPositiveClick: () => props.chat.deleteChat(user.id)
    })
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
  </div>
</template>
