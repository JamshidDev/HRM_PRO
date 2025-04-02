<script setup>
import ExamRow from './ExamRow.vue'
import ExamCard from './ExamCard.vue'
import {NoDataPicture} from "@/components/index.js";
import {useExamAttemptStore, useWorkerExamStore} from "@/store/modules/index.js";
import {useRouter} from "vue-router";
import File from "../../topicDetail/topicFile/ui/File.vue";
import {DismissCircle32Filled} from '@vicons/fluent'
const store = useWorkerExamStore()

const router = useRouter()
const examStore = useExamAttemptStore()


const startAttempt = (v) => {
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
  router.push({
    name: 'exam_attempt',
    params: {
      exam_id: v.id
    }
  })
}

onMounted(()=>{
  examStore._config_localstorage()
})
const lesson = computed(()=>{
  return store.list.find(i=>i.id==store.elementId)
})
</script>
<template>
  <div class="h-full">
    <div class="flex  justify-between border-b border-surface-line py-3" >
      <p class="text-2xl font-semibold">{{lesson?.name}}</p>
      <n-button icon-placement="right" type="tertiary" text color="#747b81" @click="store.elementId = null">
        {{ $t('content.close') }}
        <template #icon>
          <n-icon  :component="DismissCircle32Filled"/>
        </template>
      </n-button>
    </div>
    <n-tabs animated type="line" v-if="lesson" class="h-full" placement="right">
      <n-tab-pane class="h-full overflow-hidden" name="exams" :tab="$t('examPage.exams')">
        <div class="overflow-auto h-full">
        <n-collapse class="flex flex-col gap-2 pt-2" v-if="!!lesson.exams.length">
          <exam-card v-for="(exam, idx) in lesson.exams" :key="idx" :exam="exam" />
        </n-collapse>
  <!--      <n-table-->
  <!--          v-if="!!lesson.exams.length"-->
  <!--          :single-line="false"-->
  <!--      >-->
  <!--        <thead>-->
  <!--        <tr>-->
  <!--          <th></th>-->
  <!--          <th>{{$t('examPage.exam')}}</th>-->
  <!--          <th>{{ $t('solveExamPage.variant') }}</th>-->
  <!--          <th>{{ $t('solveExamPage.totalTime') }}</th>-->
  <!--          <th>{{ $t('solveExamPage.deadline') }}</th>-->
  <!--          <th>{{ $t('solveExamPage.leftAttempts') }}</th>-->
  <!--          <th>{{ $t('solveExamPage.questions') }}</th>-->
  <!--          <th class="max-w-[150px] !text-center w-[150px]">{{$t('content.action')}}</th>-->
  <!--        </tr>-->
  <!--        </thead>-->
  <!--        <tbody>-->
  <!--        <exam-row-->
  <!--            v-for="(exam,idx) in lesson.exams"-->
  <!--            :exam="exam"-->
  <!--            :key="idx"-->
  <!--            @continue="goPush"-->
  <!--            @view="viewExam"-->
  <!--            @start="startAttempt(exam)"-->
  <!--            :row-num="idx+1"-->
  <!--        />-->
  <!--        </tbody>-->
  <!--      </n-table>-->
        </div>
      </n-tab-pane>
      <n-tab-pane name="files" :tab="$t('examPage.resources')">
        <div class="grid gap-2 grid-cols-[repeat(auto-fill,minmax(100px,1fr))] p-1"  v-if="!!lesson.files.length">
          <div
              class="h-[130px] bg-surface-section rounded-md flex justify-center items-center drop-shadow-sm cursor-pointer hover:drop-shadow-lg transition-all border-surface-line border"
              v-for="(item, idx) in lesson.files" :key="idx"
          >
            <File :file="item" />
          </div>

        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>