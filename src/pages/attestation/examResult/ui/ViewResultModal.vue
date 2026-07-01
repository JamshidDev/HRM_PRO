<script setup>
  import { useExamAttemptStore } from '@/store/modules'
  import QuestionCard from './QuestionCard.vue'
  import { NoDataPicture } from '@/components/index.js'

  const store = useExamAttemptStore()
</script>
<template>
  <n-spin :show="store.loading">
    <div class="flex flex-col gap-3 p-3 overflow-y-auto max-h-[calc(90vh-180px)]">
      <QuestionCard
        v-for="(question, idx) in store.questions"
        :id="`question-${idx + 1}`"
        :key="idx"
        :question="question"
        :number="idx + 1"
        class="shrink-0"
      />
      <NoDataPicture v-if="store.questions.length === 0 && !store.loading" />
    </div>
  </n-spin>
</template>
<style lang="scss" scoped></style>
