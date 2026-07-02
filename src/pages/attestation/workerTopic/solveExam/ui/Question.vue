<script setup>
  import { UIEditorViewer } from '@/components/index.js'
  import { useExamAttemptStore } from '@/store/modules'
  import { Checkmark16Filled } from '@vicons/fluent'

  const store = useExamAttemptStore()
  defineProps({
    question: {
      type: Object,
      required: true
    },
    number: {
      type: Number,
      required: true
    }
  })

  const sendResult = (question_id, option_id) => {
    if (!store.result) {
      store.questionId = question_id
      store.payload.result = option_id
      store._send_result()
    }
  }
</script>

<template>
  <div class="bg-surface-section rounded-xl border border-surface-line p-4 shadow-sm scroll-mt-4">
    <div class="flex gap-3">
      <span
        class="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm"
      >
        {{ number }}
      </span>
      <div class="grow pt-1 min-w-0">
        <UIEditorViewer :html="question.question"></UIEditorViewer>
      </div>
    </div>

    <n-divider class="my-3!" />

    <div class="flex flex-col gap-2">
      <button
        v-for="(option, idx) in question.answers"
        :key="idx"
        type="button"
        :disabled="(store.sendResultLoading && store.questionId === question.id) || !!store.result"
        class="group flex items-start gap-3 w-full text-left rounded-lg border p-2.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
        :class="
          option.id === question.result
            ? 'border-primary bg-primary/5'
            : 'border-surface-line hover:border-primary'
        "
        @click="sendResult(question.id, option.id)"
      >
        <span
          class="shrink-0 relative flex items-center justify-center w-7 h-7 rounded-full border text-sm font-semibold transition-colors"
          :class="
            option.id === question.result
              ? 'bg-primary border-primary text-white'
              : 'border-surface-line text-textColor2 group-hover:border-primary'
          "
        >
          <n-spin
            v-if="
              store.sendResultLoading &&
              store.questionId === question.id &&
              store.payload.result === option.id
            "
            :size="14"
          />
          <n-icon v-else-if="option.id === question.result" :component="Checkmark16Filled" />
          <template v-else>{{ store.options[idx] }}</template>
        </span>
        <div class="grow min-w-0 pt-0.5">
          <UIEditorViewer :html="option.text" />
        </div>
      </button>
    </div>
  </div>
</template>
