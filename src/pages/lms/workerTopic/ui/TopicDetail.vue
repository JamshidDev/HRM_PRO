<script setup>
import ExamRow from './ExamRow.vue'
import {NoDataPicture} from "@/components/index.js";
import {useExamAttemptStore, useWorkerExamStore} from "@/store/modules/index.js";
import {useRouter} from "vue-router";
import {Book24Filled, Image48Filled, MusicNote224Filled, VideoClip24Filled} from "@vicons/fluent";

const store = useWorkerExamStore()

const router = useRouter()
const examStore = useExamAttemptStore()
const showFile = (file) => {
  $MediaViewer.showMediaViewer(file.file, file.file_extension)
}

const MediaTypeEnum = {
  VIDEO: "1",
  IMAGE: "2",
  BOOK: "3",
  AUDIO: "4"
}

const getMediaProperty = (v) => {
  switch (v) {
    case MediaTypeEnum.BOOK:
      return {
        icon: Book24Filled
      }
    case MediaTypeEnum.IMAGE:
      return {
        icon: Image48Filled
      }
    case MediaTypeEnum.VIDEO:
      return {
        icon: VideoClip24Filled
      }
    case MediaTypeEnum.AUDIO:
      return {
        icon: MusicNote224Filled
      }
  }
}


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
  <n-tabs animated type="line" v-if="lesson">
    <n-tab-pane name="exams" :tab="$t('examPage.exams')">
      <n-table
          v-if="!!lesson.exams.length"
          :single-line="false"
      >
        <thead>
        <tr>
          <th></th>
          <th>{{$t('examPage.exam')}}</th>
          <th>{{ $t('solveExamPage.variant') }}</th>
          <th>{{ $t('solveExamPage.totalTime') }}</th>
          <th>{{ $t('solveExamPage.deadline') }}</th>
          <th>{{ $t('solveExamPage.leftAttempts') }}</th>
          <th>{{ $t('solveExamPage.questions') }}</th>
          <th class="max-w-[150px] !text-center w-[150px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <exam-row
            v-for="(exam,idx) in lesson.exams"
            :exam="exam"
            :key="idx"
            @continue="goPush"
            @view="viewExam"
            @start="startAttempt(exam)"
            :row-num="idx+1"
        />
        </tbody>
      </n-table>
      <NoDataPicture class="!my-0" v-else />
    </n-tab-pane>
    <n-tab-pane name="files" :tab="$t('examPage.resources')">
      <div class="grid gap-4 flex-wrap grid-cols-[repeat(auto-fill,minmax(100px,1fr))]" v-if="!!lesson.files.length">
        <div
            v-for="(file, idx) in lesson.files"
            :key="idx"
            class="flex flex-col grow gap-3 items-center w-24 text-center border rounded-md p-3 border-gray-300 justify-center"
        >
          <n-button
              circle
              size="large"
              @click="showFile(file)"
          >
            <template #icon>
              <n-icon
                  :component="getMediaProperty(file.type.id).icon"
              ></n-icon>
            </template>
          </n-button>
          <div class="truncate max-w-full">
            <p class="text-sm truncate ">{{ file.file_name }}</p>
          </div>
        </div>
      </div>
      <NoDataPicture class="!my-0" v-else />

    </n-tab-pane>
  </n-tabs>
</template>