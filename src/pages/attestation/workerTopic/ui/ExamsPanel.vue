<script setup>
import ExamCard from './ExamCard.vue'
import {useExamAttemptStore, useAccountStore} from "@/store/modules/index.js";

const examStore = useExamAttemptStore()
const accStore = useAccountStore()

const router = useRouter()
defineProps({
  exams: Array
})


const startAttempt = (v) => {
  if(!accStore.checkAction(accStore.pn.examExamsWrite)) return
  examStore.elementId = v.id
  examStore._start_attempt()
}

const goPush = (v) => {
  router.push({
    name: 'solve_exam',
    params: {
      exam_id: v.id
    }
  })
}

const viewExam = (v) => {
  examStore.visible=true
  examStore.elementId = v.id
  examStore._get_attempt()
}

</script>
<template>
  <template v-for="(exam, idx) in exams" :key="idx">
    <n-divider v-if="idx!==0" class="my-2!" />
    <exam-card

        @continue="goPush"
               @view="viewExam"
               @start="startAttempt(exam)"
               :exam="exam"/>
  </template>
</template>