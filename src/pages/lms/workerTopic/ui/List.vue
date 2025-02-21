<script setup>
import {NoDataPicture, UIPagination} from "@/components/index.js"
import {useExamAttemptStore, useWorkerExamStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import {
  Book24Filled,
  Image48Filled,
  MusicNote224Filled,
  VideoClip24Filled,
} from "@vicons/fluent";

import LessonCard from './LessonCard.vue'
const store = useWorkerExamStore()


const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
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



const downloadFile = (file) => {
  let a = document.createElement('a')
  a.href = file.file
  a.target = '_blank'
  a.click()
  a.remove()
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div v-if="store.list.length>0" class="w-full overflow-x-auto flex flex-col gap-5">
      <template v-for="(item, idx) in store.list" :key="idx">
        <LessonCard :lesson="item" />
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
