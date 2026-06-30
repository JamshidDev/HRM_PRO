<script setup>
  import { UIEditorViewer } from '@/components/index.js'
  import { useExamAttemptStore } from '@/store/modules'
  import { DismissCircle16Filled, Warning16Filled } from '@vicons/fluent'

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
</script>

<template>
  <div class="bg-surface-section rounded-xl border border-surface-line p-4 shadow-sm">
    <div class="flex gap-3">
      <span
        class="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm"
      >
        {{ number }}
      </span>
      <div class="grow pt-1 min-w-0">
        <UIEditorViewer :html="question.question" />
      </div>
    </div>

    <n-divider class="my-3!" />

    <div class="flex flex-col gap-2">
      <div
        v-for="(option, idx) in question.answers"
        :key="idx"
        class="flex items-start gap-3 w-full rounded-lg border p-2.5"
        :class="
          option.id === question.result
            ? 'border-danger bg-danger/5'
            : 'border-surface-line'
        "
      >
        <span
          class="shrink-0 flex items-center justify-center w-7 h-7 rounded-full border text-sm font-semibold"
          :class="
            option.id === question.result
              ? 'bg-danger border-danger text-white'
              : 'border-surface-line text-textColor2'
          "
        >
          {{ store.options[idx] }}
        </span>
        <div class="grow min-w-0 pt-0.5">
          <UIEditorViewer :html="option.text" />
        </div>
      </div>
    </div>

    <div
      class="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium"
      :class="question.result == null ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'"
    >
      <n-icon :component="question.result == null ? Warning16Filled : DismissCircle16Filled" />
      {{ question.result == null ? $t('examPage.notChosen') : $t('examPage.wrongAnswer') }}
    </div>
  </div>
</template>
