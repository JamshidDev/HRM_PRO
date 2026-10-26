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

  // Klaviatura: ↓/↑ — ro'yxat bo'ylab bittadan yurish (tanlangan qator ko'rinib turadi), Enter — ochish.
  const activeIndex = ref(-1)
  const listRef = ref(null)
  watch(results, (list) => {
    activeIndex.value = list.length ? 0 : -1
  })

  const setActive = (index) => {
    activeIndex.value = index
    nextTick(() => listRef.value?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: 'nearest' }))
  }

  const onKeydown = (e) => {
    const count = results.value.length
    if (!count) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((activeIndex.value + step + count) % count)
    } else if (e.key === 'Enter' && results.value[activeIndex.value]) {
      e.preventDefault()
      emit('pick', results.value[activeIndex.value])
    }
  }
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
      @keydown="onKeydown"
    >
      <template #prefix>
        <n-icon size="18" class="text-textColor3"><Search24Regular /></n-icon>
      </template>
    </n-input>

    <div ref="listRef" class="user-list min-h-[200px] max-h-[380px] overflow-y-auto">
      <div v-if="loading" class="flex justify-center py-10"><n-spin size="small" /></div>
      <template v-else-if="results.length">
        <div
          v-for="(user, index) in results"
          :key="user.id"
          :data-index="index"
          class="list-in flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
          :class="index === activeIndex && 'bg-surface-ground'"
          :style="{ animationDelay: Math.min(index, 8) * 30 + 'ms' }"
          @mousemove="activeIndex = index"
          @click="emit('pick', user)"
        >
          <div class="relative flex shrink-0">
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

<style scoped>
  /* Natijalar birin-ketin, pastdan yengil chiqadi */
  .list-in {
    animation: list-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes list-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
  }
  /* Ingichka scrollbar, strelkalarsiz (chat oynasidagi kabi) */
  .user-list {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--textColor3) 45%, transparent) transparent;
  }
  .user-list::-webkit-scrollbar {
    width: 6px;
  }
  .user-list::-webkit-scrollbar-button {
    display: none;
  }
  .user-list::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--textColor3) 45%, transparent);
    border-radius: 9999px;
  }
</style>
