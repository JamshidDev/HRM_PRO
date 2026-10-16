<script setup>
  import { NAvatar } from 'naive-ui'
  import { UIModal } from '@components'
  import { Search24Regular } from '@vicons/fluent'
  import { getInitials, getAvatarColor } from './format.js'

  // Yangi suhbat: xodimni server bo'yicha qidirish (kamida 2 harf).
  const show = defineModel('show', { type: Boolean, default: false })
  const props = defineProps({
    chat: { type: Object, required: true }
  })
  const emit = defineEmits(['pick'])

  const term = ref('')
  const results = ref([])
  const loading = ref(false)
  const inputRef = ref(null)
  let timer = null
  let seq = 0

  watch(term, (value) => {
    clearTimeout(timer)
    const q = (value || '').trim()
    if (q.length < 2) {
      results.value = []
      loading.value = false
      return
    }
    loading.value = true
    timer = setTimeout(async () => {
      const my = ++seq
      try {
        const list = await props.chat.searchUsers(q)
        if (my === seq) results.value = list
      } finally {
        if (my === seq) loading.value = false
      }
    }, 300)
  })

  watch(show, (value) => {
    if (value) nextTick(() => inputRef.value?.focus())
    else {
      term.value = ''
      results.value = []
    }
  })
</script>

<template>
  <UIModal v-model:visible="show" :width="440" :title="$t('liveChatPage.newChat')">
    <n-input
      ref="inputRef"
      v-model:value="term"
      clearable
      round
      :placeholder="$t('liveChatPage.searchEmployee')"
      class="mb-2"
    >
      <template #prefix>
        <n-icon size="18" class="text-textColor3"><Search24Regular /></n-icon>
      </template>
    </n-input>

    <div class="min-h-[200px] max-h-[380px] overflow-y-auto">
      <div v-if="loading" class="flex justify-center py-10"><n-spin size="small" /></div>
      <template v-else-if="results.length">
        <div
          v-for="user in results"
          :key="user.id"
          class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-ground"
          @click="emit('pick', user)"
        >
          <div class="relative shrink-0">
            <n-avatar round :size="40" :src="user.photo" :color="getAvatarColor(user.id)">
              {{ getInitials(user.fullName) }}
            </n-avatar>
            <span
              v-if="user.online"
              class="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-surface-section bg-success"
            />
          </div>
          <div class="min-w-0">
            <div class="truncate text-sm font-medium text-textColor0">{{ user.fullName }}</div>
            <div class="truncate text-xs text-textColor3">{{ user.position || '—' }}</div>
          </div>
        </div>
      </template>
      <div v-else class="py-10 text-center text-sm text-textColor3">
        {{ term.trim().length < 2 ? $t('liveChatPage.searchMinHint') : $t('liveChatPage.noUsers') }}
      </div>
    </div>
  </UIModal>
</template>
