<script setup>
import ExamCard from './ExamCard.vue'
import {useExamAttemptStore, useWorkerExamStore} from "@/store/modules/index.js";
import {useRouter} from "vue-router";
import File from "../../topic/topicDetail/topicFile/ui/File.vue";
import {DismissCircle32Filled, Folder20Filled, PeopleEdit20Filled} from '@vicons/fluent'

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

onMounted(() => {
  examStore._config_localstorage()
})
const cards = ref([{
  id: 1,
  icon: markRaw(PeopleEdit20Filled),
  color: "#8a8a8a",
  desc: 'examPage.nExams',
  title: 'examPage.name',
  count: 0,
}, {
  id: 2,
  icon: markRaw(Folder20Filled),
  color: "#2080f0",
  desc: 'examPage.nFiles',
  title: 'content.files',
  count: 0
}])
const lesson = ref(undefined)
watch(store, (v) => {
  const found = store.list.find(i => i.id == store.elementId)
  console.log(found)
  if (found) {
    cards.value[0].count = found.exams.length
    cards.value[1].count = found.files.length
    lesson.value = found
  } else {
    cards.value[0].count = 0
    cards.value[1].count = 0
    lesson.value = undefined
  }
}, {
  immediate: true
})

const activeTab = ref(1)

</script>
<template>
  <div class="h-full">
    <div class="flex  justify-between border-b border-surface-line p-3">
      <p class="text-2xl font-semibold">{{ lesson?.name }}</p>
      <n-button color="#747b81" icon-placement="right" quaternary type="tertiary" @click="store.elementId = null">
        {{ $t('content.close') }}
        <template #icon>
          <n-icon :component="DismissCircle32Filled"/>
        </template>
      </n-button>
    </div>
    <div class="p-2">
      <div v-if="lesson" class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
        <template v-for="(card, idx) in cards" :key="idx">
          <div
              class="w-full p-4 py-3 bg-blue-50 rounded-md transition-all hover:bg-blue-100 cursor-pointer flex flex-col gap-2"
              :class="{'bg-blue-100': card.id===activeTab}"
              @click="activeTab=card.id"
          >
            <div class="flex items-center gap-1">
              <n-icon-wrapper :border-radius="10" :color="card.color" :size="30" class="shrink-0">
                <n-icon :component="card.icon" :size="18" color="#FFF"/>
              </n-icon-wrapper>
              <p class="text-primary font-medium text-lg">{{ $t(card.title) }}</p>
            </div>
            <p class="text-xs text-gray-500 font-semibold">
              {{ $t(card.desc, {n: card.count}) }}
            </p>
          </div>
        </template>
      </div>
      <n-tabs v-if="lesson" v-model:value="activeTab" :tab-style="{display: 'none'}" animated class="h-full">

        <n-tab-pane :name="1">
          <div class="h-full">
            <div v-if="!!lesson.exams.length" class="flex flex-col">
              <template v-for="(exam, idx) in lesson.exams" :key="idx">
                <n-divider v-if="idx!==0" class="!my-2" />
                <exam-card :exam="exam"/>
              </template>
            </div>
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
        <n-tab-pane :name="2">
          <div v-if="!!lesson.files.length" class="grid gap-2 grid-cols-[repeat(auto-fill,minmax(100px,1fr))] p-1">
            <div
                v-for="(item, idx) in lesson.files"
                :key="idx"
                class="h-[130px] bg-surface-section rounded-md flex justify-center items-center drop-shadow-sm cursor-pointer hover:drop-shadow-lg transition-all border-surface-line border"
            >
              <File :file="item"/>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>