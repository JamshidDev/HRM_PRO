<script setup>
  import { UIEditorViewer } from '@/components/index.js'
  import { useExamAttemptStore } from '@/store/modules'
  import { DismissCircle16Filled } from '@vicons/fluent'

  const store = useExamAttemptStore()
  const props = defineProps({
    question: {
      type: Object,
      required: true
    },
    number: {
      type: Number,
      required: true
    }
  })

  // Tizim to'g'ri javobni ko'rsatmaydi (savol to'g'ri topilgan bo'lsa ham) — shu sababli
  // faqat foydalanuvchi noto'g'ri tanlagan variant qizil bilan ajratiladi.
  const isWrongSelection = (option) =>
    props.question.result != null && option.id === props.question.result
</script>

<template>
  <div class="bg-surface-section rounded-xl border border-surface-line p-4">
    <div class="flex gap-3">
      <span
        class="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm"
      >
        {{ String(number).padStart(2, '0') }}
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
        class="flex items-center justify-between gap-3 w-full rounded-lg p-2.5"
        :class="isWrongSelection(option) ? 'bg-danger/10' : ''"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span
            class="shrink-0 flex items-center justify-center w-7 h-7 rounded-full border text-sm font-semibold"
            :class="
              isWrongSelection(option)
                ? 'bg-danger border-danger text-white'
                : 'border-surface-line text-textColor2'
            "
          >
            {{ store.options[idx] }}
          </span>
          <div class="min-w-0" :class="isWrongSelection(option) ? 'text-danger' : ''">
            <UIEditorViewer :html="option.text" />
          </div>
        </div>
        <n-icon
          v-if="isWrongSelection(option)"
          :component="DismissCircle16Filled"
          :size="20"
          class="text-danger shrink-0"
        />
      </div>
    </div>
  </div>
</template>
