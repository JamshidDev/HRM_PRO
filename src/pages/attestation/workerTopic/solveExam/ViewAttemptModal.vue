<script setup>
import {useExamAttemptStore} from "@/store/modules";
import QuestionCard from './ui/ViewQuestion.vue'
import {NoDataPicture} from "@/components/index.js";

const store = useExamAttemptStore()

</script>
<template>
  <n-spin :show="store.loading" class="h-[90vh] max-h-[90vh]">
    <div class="h-full flex flex-col-reverse sm:flex-row gap-3">
      <div class="flex flex-col gap-3 grow overflow-y-auto p-3 lg:mx-10 xl:mx-20">
        <QuestionCard
            v-for="(question, idx) in store.questions"
            :id="`question-${idx+1}`" :key="idx" :question="question"
            class="shrink-0"
        />
        <NoDataPicture v-if="store.questions.length===0 && !store.loading"/>
      </div>
    </div>
  </n-spin>
</template>
<style lang="scss" scoped>

</style>