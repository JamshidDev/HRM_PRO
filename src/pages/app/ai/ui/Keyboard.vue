<script setup>
  import { useAIConversationStore } from '@/store/modules/index.js'
  import { ChatMultiple24Regular, Send24Filled } from '@vicons/fluent'

  const store = useAIConversationStore()

  const goChat = () => {
    // store.messages = store.archiveMessage
    store.historyMode = false
    store.questionParams.date = store.today
    store.questions()
  }
</script>

<template>
  <div
    class="rounded-3xl bg-surface-section relative py-2 px-2 border border-surface-line shadow-keyboard overflow-hidden flex items-center gap-2"
  >
    <n-input
      @keyup.enter="store.sendMessage"
      :bordered="false"
      class="w-full!"
      v-model:value="store.payload.question"
      :rows="1"
      :autosize="{
        minRows: 1,
        maxRows: 1
      }"
      size="small"
      :loading="store.loading"
      :placeholder="$t('aiConversation.form.askQuestion')"
    />
    <button
      type="button"
      @click="store.sendMessage()"
      :disabled="store.loading || !store.payload.question?.trim()"
      class="w-9 h-9 shrink-0 rounded-full bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-opacity"
    >
      <n-icon size="16" class="text-white">
        <Send24Filled />
      </n-icon>
    </button>
    <span
      v-if="store.historyMode && store.today !== store.questionParams.date"
      @click="goChat"
      class="w-full h-full absolute top-0 left-0 flex justify-center items-center gap-2 z-10 bg-surface-ground cursor-pointer text-[#90A1B9]"
    >
      <n-icon size="24" class="text-[#90A1B9] cursor-pointer text-wrap">
        <ChatMultiple24Regular />
      </n-icon>
      {{ $t('aiConversation.form.goChat') }}
    </span>
  </div>
</template>

<style scoped>
  .shadow-keyboard {
    box-shadow:
      rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
      rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
  }
</style>
