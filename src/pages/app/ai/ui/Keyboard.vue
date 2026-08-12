<script setup>
  import { useAIConversationStore } from '@/store/modules/index.js'
  import { ChatMultiple24Regular } from '@vicons/fluent'
  import Aitelegram from '@/assets/icons/AItelegram.svg'

  defineProps({
    showPanel: {
      type: Boolean,
      default: true
    }
  })

  const store = useAIConversationStore()

  const goChat = () => {
    // store.messages = store.archiveMessage
    store.historyMode = false
    store.questionParams.date = store.today
    store.questions()
  }
</script>

<template>
  <div class="relative flex items-center gap-2 w-full max-w-[800px]">
    <n-input
      @keyup.enter="store.sendMessage"
      :bordered="false"
      class="keyboard-input flex-1 h-14! rounded-3xl! px-2 border border-surface-line text-base! font-medium! text-textColor0"
      :class="showPanel ? 'keyboard-input--page' : 'keyboard-input--modal'"
      v-model:value="store.payload.question"
      :rows="1"
      :autosize="{
        minRows: 1,
        maxRows: 1
      }"
      size="small"
      :placeholder="$t(showPanel ? 'aiConversation.form.askQuestionOrMic' : 'aiConversation.form.askQuestion')"
    />
    <button
      type="button"
      @click="store.sendMessage()"
      :disabled="store.loading || !store.payload.question?.trim()"
      class="w-14 h-14 shrink-0 rounded-full bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-opacity"
    >
      <n-icon size="20" class="text-white">
        <Aitelegram />
      </n-icon>
    </button>
    <span
      v-if="store.historyMode && store.today !== store.questionParams.date"
      @click="goChat"
      class="w-full h-full absolute top-0 left-0 flex justify-center items-center gap-2 z-10 bg-surface-ground cursor-pointer text-textColor3"
    >
      <n-icon size="24" class="text-textColor3 cursor-pointer text-wrap">
        <ChatMultiple24Regular />
      </n-icon>
      {{ $t('aiConversation.form.goChat') }}
    </span>
  </div>
</template>

<style scoped>
  .keyboard-input--modal {
    --n-color: #eaecf0 !important;
    --n-color-focus: #eaecf0 !important;
  }
  [data-theme='dark'] .keyboard-input--modal {
    --n-color: var(--surface-line) !important;
    --n-color-focus: var(--surface-line) !important;
  }

  .keyboard-input--page {
    --n-color: var(--surface-section) !important;
    --n-color-focus: var(--surface-section) !important;
  }
  .keyboard-input--page:focus-within {
    border-color: var(--primary-color) !important;
  }
</style>
