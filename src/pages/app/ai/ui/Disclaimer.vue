<script setup>
  import { Sparkle16Filled } from '@vicons/fluent'
  import { useAccountStore, useAIConversationStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import robotImage from '@/assets/images/content/robot-image.svg?url'

  const { t } = i18n.global
  const accountStore = useAccountStore()
  const store = useAIConversationStore()

  const greetingKey = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'aiConversation.greeting.morning'
    if (hour < 18) return 'aiConversation.greeting.day'
    return 'aiConversation.greeting.evening'
  })

  const suggestions = [
    'aiConversation.suggestions.leaveBalance',
    'aiConversation.suggestions.lastSalary',
    'aiConversation.suggestions.getReference',
    'aiConversation.suggestions.workedDays'
  ]

  const sendSuggestion = (key) => {
    if (store.loading) return
    store.payload.question = t(key)
    store.sendMessage()
  }
</script>

<template>
  <div v-if="store.messages.length === 0" class="w-full mb-10 flex flex-col items-center text-center">
    <img :src="robotImage" alt="" class="w-20 h-20 mb-4 object-contain select-none" draggable="false" />

    <h1 class="text-2xl font-bold text-textColor1 mb-2">
      {{ $t(greetingKey, { n: accountStore.fullName }) }}
    </h1>
    <p class="text-base text-textColor2 mb-8">
      {{ $t('aiConversation.canIHelpYouToday') }}
    </p>

    <div class="grid grid-cols-2 gap-3 w-full max-w-[560px]">
      <button
        v-for="key in suggestions"
        :key="key"
        type="button"
        @click="sendSuggestion(key)"
        class="flex items-center gap-2 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary px-4 py-3 text-sm font-medium transition-colors text-left cursor-pointer"
      >
        <n-icon size="16" class="shrink-0">
          <Sparkle16Filled />
        </n-icon>
        <span>{{ $t(key) }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
