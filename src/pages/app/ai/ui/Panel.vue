<script setup>
  import dayjs from 'dayjs'
  import { useAIConversationStore } from '@/store/modules/index.js'
  import { Add24Filled, Search24Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useAIConversationStore()
  const containerRef = ref(null)
  const search = ref('')

  const onSelect = (v) => {
    if (!store.historyMode) {
      store.archiveMessage = [...store.messages]
    }
    store.historyMode = true

    store.questionParams.date = v.date
    store.questionParams.page = 1
    store.questions()
  }

  const onNewChat = () => {
    store.historyMode = false
    store.questionParams.date = store.today
    store.questionParams.page = 1
    store.questions()
  }

  const filteredList = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return store.list
    return store.list.filter((item) => item.question?.toLowerCase().includes(q))
  })

  const groupedList = computed(() => {
    const yesterday = dayjs(store.today).subtract(1, 'day').format('YYYY-MM-DD')
    const groups = []
    const map = new Map()
    filteredList.value.forEach((item) => {
      const dateKey = item.date
      let label
      if (dateKey === store.today) label = t('aiConversation.form.today')
      else if (dateKey === yesterday) label = t('aiConversation.form.yesterday')
      else label = dateKey

      if (!map.has(label)) {
        map.set(label, { label, items: [] })
        groups.push(map.get(label))
      }
      map.get(label).items.push(item)
    })
    return groups
  })

  const containerScrollEv = () => {
    const container = containerRef.value

    container.addEventListener('scroll', () => {
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight

      if (
        scrollTop + clientHeight === scrollHeight &&
        !store.listLoading &&
        store.totalList > store.list.length
      ) {
        store.listParams.page++
        store.getList(true)
      }
    })
  }

  onMounted(() => {
    containerScrollEv()
    store.getList()
  })
</script>

<template>
  <div ref="containerRef" class="flex flex-col overflow-y-auto bg-surface-section h-full px-3 py-4">
    <h2 class="text-lg font-semibold text-textColor0 mb-4 shrink-0 px-1">
      {{ $t('aiConversation.form.chatHistory') }}
    </h2>

    <button
      type="button"
      @click="onNewChat"
      class="new-chat-btn flex items-center justify-center gap-2 w-full rounded-xl py-2.5 mb-3 text-white font-medium text-base bg-primary hover:opacity-90 transition-opacity cursor-pointer shrink-0"
    >
      <n-icon size="20">
        <Add24Filled />
      </n-icon>
      {{ $t('aiConversation.form.newChat') }}
    </button>

    <n-input
      v-model:value="search"
      :bordered="false"
      class="search-input mb-4 shrink-0 h-11! text-base!"
      :placeholder="$t('aiConversation.form.searchConversations')"
    >
      <template #prefix>
        <n-icon size="20" class="text-textColor3">
          <Search24Regular />
        </n-icon>
      </template>
    </n-input>

    <n-spin :show="store.listLoading">
      <template v-for="group in groupedList" :key="group.label">
        <div class="text-xs font-medium text-textColor3 mb-2 mt-4 first:mt-0 px-1">
          {{ group.label }}
        </div>
        <div
          v-for="(item, index) in group.items"
          :key="item.id ?? index"
          @click="onSelect(item)"
          class="history-item truncate w-full rounded-lg px-2 py-2 mb-1 cursor-pointer text-sm font-medium text-textColor0"
        >
          {{ item.question }}
        </div>
      </template>
    </n-spin>
  </div>
</template>

<style scoped>
  .search-input {
    --n-color: var(--surface-ground) !important;
    --n-color-focus: var(--surface-ground) !important;
    border: 1px solid var(--surface-line);
    border-radius: 0.75rem;
  }

  .history-item {
    transition: background-color 0.15s ease;
  }
  .history-item:hover {
    background: var(--surface-ground);
  }
</style>
