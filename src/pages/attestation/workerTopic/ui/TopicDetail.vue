<script setup>
  import { useExamAttemptStore, useWorkerExamStore } from '@/store/modules/index.js'
  import ExamsPanel from './ExamsPanel.vue'
  import { DismissCircle32Filled } from '@vicons/fluent'

  const store = useWorkerExamStore()
  const examStore = useExamAttemptStore()

  onMounted(() => {
    examStore._config_localstorage()
  })
</script>
<template>
  <div class="flex flex-col h-full">
    <div class="flex justify-between border-b border-surface-line p-3 shrink-0">
      <p class="text-sm md:text-2xl font-semibold">{{ store.selectedLesson?.name }}</p>
      <n-button
        color="#747b81"
        icon-placement="right"
        quaternary
        type="tertiary"
        @click="store.selectedLesson = null"
      >
        {{ $t('content.close') }}
        <template #icon>
          <n-icon :component="DismissCircle32Filled" />
        </template>
      </n-button>
    </div>
    <div class="p-2 grow basis-auto overflow-auto">
      <ExamsPanel v-if="store.selectedLesson" :exams="store.selectedLesson.exams" />
    </div>
  </div>
</template>
