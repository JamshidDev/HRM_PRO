<script setup>
  import { UIModal } from '@components'
  import { Search24Regular } from '@vicons/fluent'
  import ChatUserItem from './ChatUserItem.vue'

  const show = defineModel('show', { type: Boolean, default: false })
  const props = defineProps({
    chat: { type: Object, required: true }
  })
  const emit = defineEmits(['forward'])

  const search = ref('')

  // Sidebar bilan bir xil ro'yxat, lekin bu yerdagi qidiruv o'z alohida
  // holatida — sidebar filtrini ochiq turgan holda buzmasligi kerak.
  const targets = computed(() => {
    const term = search.value.trim().toLowerCase()
    return props.chat.userList.value.filter((u) => !term || u.fullName.toLowerCase().includes(term))
  })

  const pick = (userId) => {
    emit('forward', userId)
    show.value = false
  }

  watch(show, (value) => {
    if (!value) search.value = ''
  })
</script>

<template>
  <UIModal v-model:visible="show" :width="420" :title="$t('liveChatPage.forwardTo')">
    <n-input v-model:value="search" clearable round :placeholder="$t('liveChatPage.searchPlaceholder')" class="mb-2">
      <template #prefix>
        <n-icon size="18" class="text-textColor3"><Search24Regular /></n-icon>
      </template>
    </n-input>

    <div class="max-h-[360px] overflow-y-auto">
      <ChatUserItem
        v-for="user in targets"
        :key="user.id"
        :user="user"
        :show-actions="false"
        @click="pick(user.id)"
      />

      <div v-if="!targets.length" class="py-10 text-center text-sm text-textColor3">
        {{ $t('liveChatPage.noUsers') }}
      </div>
    </div>
  </UIModal>
</template>
