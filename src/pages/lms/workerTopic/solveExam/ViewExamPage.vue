<script setup>
import {useRoute, useRouter} from 'vue-router';
import {useExamAttemptStore} from "@/store/modules";
import QuestionCard from './ui/ViewQuestion.vue'
import Utils from "@/utils/Utils.js";
import {AppPaths} from "@/utils/index.js";
import {NoDataPicture} from "@/components/index.js";

const store = useExamAttemptStore()
const router = useRouter()
const route = useRoute()
onMounted(() => {
  store.elementId = route.params.exam_id
  store._get_attempt()
})

const goBack = ()=>{
  router.push(Utils.routeLmsPathMaker(AppPaths.Exam))
}

</script>
<template>
  <div class="h-full">
    <n-spin :show="store.loading" class="h-full">
      <div class="h-full flex flex-col-reverse sm:flex-row gap-3">
        <div class="flex flex-col gap-3 flex-grow overflow-y-auto p-3 lg:mx-10 xl:mx-20">
          <QuestionCard
              v-for="(question, idx) in store.questions"
              :id="`question-${idx+1}`" :key="idx" :question="question"
              class="shrink-0"
          />
          <NoDataPicture v-if="store.questions.length===0 && !store.loading" />
        </div>
      </div>
    </n-spin>
  </div>
</template>
<style lang="scss" scoped>

</style>