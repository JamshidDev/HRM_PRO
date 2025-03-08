<script setup>
import {NoDataPicture, UIPagination} from "@/components/index.js"
import {useWorkerExamStore} from "@/store/modules/index.js"
import {
  Book24Filled,
  Image48Filled,
  MusicNote224Filled,
  VideoClip24Filled,
  HatGraduation12Filled,
} from "@vicons/fluent";

import ExamCard from './ExamCard.vue'
const store = useWorkerExamStore()


const downloadFile = (file) => {
  let a = document.createElement('a')
  a.href = file.file
  a.target = '_blank'
  a.click()
  a.remove()
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






</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div v-if="store.list.length>0" class="w-full overflow-x-auto flex flex-col gap-5">
      <template v-for="(lesson, idx) in store.list" :key="idx">
        <div class="flex flex-col gap-2 rounded-lg p-4  shrink-0">
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
          <n-collapse v-if="lesson.files.length">
            <n-collapse-item :title="$t('examPage.resources')">

              <div v-for="(file, idx) in lesson.files" :key="idx">
                <n-button
                    text
                    @click="downloadFile(file)">
                  <template #icon>
                    <n-icon :component="getMediaProperty(file.type.id).icon"></n-icon>
                  </template>
                  {{ file.file_name }}
                </n-button>
              </div>

            </n-collapse-item>
          </n-collapse>
          <n-collapse v-if="lesson.exams.length">
            <n-collapse-item :title="$t('examPage.exams')">
              <div class="flex flex-col gap-2">
                <ExamCard
                    v-for="(exam, idx) in lesson.exams"
                    :key="idx"
                    :exam="exam"
                />
              </div>
            </n-collapse-item>
          </n-collapse>
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
