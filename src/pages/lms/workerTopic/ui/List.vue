<script setup>
import {NoDataPicture, UIPagination} from "@/components/index.js"
import {useWorkerExamStore, useExamAttemptStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import {
  Book24Filled,
  Image48Filled,
  MusicNote224Filled,
  VideoClip24Filled,
  HatGraduation12Filled, Eye12Filled, ArrowSyncCheckmark24Filled, ChevronRight12Regular
} from "@vicons/fluent";
import ExamRow from './ExamRow.vue'

import Utils from "@/utils/Utils.js";

const store = useWorkerExamStore()
const examStore = useExamAttemptStore()

const router = useRouter()

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

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}


const startAttempt = (v)=>{
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


</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div v-if="store.list.length>0" class="flex flex-col gap-5 h-full overflow-hidden" >
      <template v-for="(lesson, idx) in store.list" :key="idx">
        <div class="flex flex-col gap-2 rounded-lg bg-surface-section shrink-0 p-2">
          <div class="flex items-center gap-3">
            <n-button size="large" text type="info">
              <template #icon>
                <n-icon :component="HatGraduation12Filled"/>
              </template>
              <span>{{ $t('examPage.topic') }}: {{ lesson.name }}</span>
            </n-button>
            <n-button dashed size="tiny" type="success">
              {{ lesson.type.name }}
            </n-button>
          </div>
          <n-tabs animated type="line">
            <n-tab-pane name="exams" :tab="$t('examPage.exams')">
              <n-table
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
            </n-tab-pane>
            <n-tab-pane name="files" :tab="$t('examPage.resources')">
<!--                <div class="overflow-x-auto whitespace-nowrap">-->
                  <div class="grid gap-4 flex-wrap grid-cols-[repeat(auto-fill,minmax(100px,1fr))]">
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
<!--                </div>-->

            </n-tab-pane>
<!--            <n-tab-pane name="results" :tab="$t('examPage.attemptHistory')">-->
<!--              <n-table-->
<!--                  :single-line="false"-->
<!--                  size="small"-->
<!--              >-->
<!--                <thead>-->
<!--                <tr>-->
<!--                  <th>{{$t('content.number')}}</th>-->
<!--                  <th>{{$t('examPage.startTime')}}</th>-->
<!--                  <th>{{$t('examPage.endTime')}}</th>-->
<!--                  <th>{{$t('examPage.result')}}</th>-->
<!--                  <th class="max-w-[150px] !text-center w-[150px]">{{$t('content.action')}}</th>-->
<!--                </tr>-->
<!--                </thead>-->
<!--                <tbody>-->
<!--                <template-->
<!--                  v-for="(exam, idx) in lesson.exams"-->
<!--                  :key="idx"-->
<!--                >-->
<!--                  <tr v-for="(item, idx) in exam.results" :key="idx">-->
<!--                    <td>{{idx+1}}</td>-->
<!--                    <td>{{Utils.timeWithMonth(item.created)}}</td>-->
<!--                    <td>{{item.ended && Utils.timeWithMonth(item.ended)}}</td>-->
<!--                    <td>{{item?.result && item?.result}}</td>-->
<!--                    <td class="!text-center">-->
<!--                      <n-button size="small" tertiary type="info" v-if="item.result">-->
<!--                        {{$t('content.view')}}-->
<!--                        <template #icon>-->
<!--                          <n-icon :component="Eye12Filled" />-->
<!--                        </template>-->
<!--                      </n-button>-->
<!--                      <n-button-->
<!--                          size="small"-->
<!--                          tertiary-->
<!--                          type="warning"-->
<!--                          v-else-->
<!--                          :disabled="!store.exam_storage?.[item.id]"-->
<!--                          @click="goPush(item)"-->
<!--                      >-->
<!--                        {{$t('content.continue')}}-->
<!--                        <template #icon>-->
<!--                          <n-icon :component="ArrowSyncCheckmark24Filled" />-->
<!--                        </template>-->
<!--                      </n-button>-->
<!--                    </td>-->
<!--                  </tr>-->
<!--                </template>-->
<!--                </tbody>-->
<!--              </n-table>-->
<!--            </n-tab-pane>-->
          </n-tabs>
        </div>
      </template>
      <UIPagination
          v-if="store.totalItems>store.params.per_page"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading"/>
  </n-spin>
</template>
