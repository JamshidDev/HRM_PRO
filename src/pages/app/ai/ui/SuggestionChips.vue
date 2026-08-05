<script setup>
  import { useAIConversationStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import ThreeStar from '@/assets/icons/threeStar.svg'

  const props = defineProps({
    showPanel: {
      type: Boolean,
      default: true
    }
  })

  const { t } = i18n.global
  const store = useAIConversationStore()

  const modalSuggestions = [
    'aiConversation.suggestions.leaveBalance',
    'aiConversation.suggestions.lastSalary',
    'aiConversation.suggestions.getReference',
    'aiConversation.suggestions.workedDays'
  ]

  const pageSuggestions = [
    'aiConversation.suggestions.leaveBalance',
    'aiConversation.suggestions.lastSalary',
    'aiConversation.suggestions.getReference',
    'aiConversation.suggestions.workedDaysShort',
    'aiConversation.suggestions.workSchedule',
    'aiConversation.suggestions.workedDays'
  ]

  const suggestions = computed(() => (props.showPanel ? pageSuggestions : modalSuggestions))

  const sendSuggestion = (key) => {
    if (store.loading) return
    store.payload.question = t(key)
    store.sendMessage()
  }
</script>

<template>
  <div
    class="w-full max-w-[800px] mx-auto py-3 flex flex-wrap gap-3"
    :class="showPanel ? 'justify-center px-4' : 'justify-start'"
  >
    <button
      v-for="key in suggestions"
      :key="key"
      type="button"
      @click="sendSuggestion(key)"
      :class="showPanel ? 'suggestion-chip-page' : 'suggestion-chip'"
      class="flex items-center gap-3 rounded-2xl hover:opacity-80 text-textColor0 px-6 py-2 text-base font-medium transition-opacity text-left cursor-pointer whitespace-nowrap"
    >
      <n-icon size="32" class="shrink-0">
        <ThreeStar />
      </n-icon>
      <span>{{ $t(key) }}</span>
    </button>
  </div>
</template>

<style scoped>
  .suggestion-chip {
    background: #eff8ff;
  }
  [data-theme='dark'] .suggestion-chip {
    background: rgba(18, 121, 240, 0.14);
  }

  .suggestion-chip-page {
    background: rgba(209, 233, 255, 0.5);
  }
  [data-theme='dark'] .suggestion-chip-page {
    background: rgba(18, 121, 240, 0.14);
  }
</style>
