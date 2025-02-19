<script setup>
import {NoDataPicture, UIPagination} from "@/components/index.js"
import {useWorkerExamStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import Utils from "@/utils/Utils.js"
import {
  Book24Filled,
  ClockAlarm32Filled,
  HatGraduation12Filled,
  Image48Filled,
  MusicNote224Filled,
  VideoClip24Filled
} from "@vicons/fluent";

const store = useWorkerExamStore()
const router = useRouter()

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

// const onSelect = (v)=>{
//   if(v.key === 'view'){
//     router.push(`${AppPaths.Lms}${AppPaths.Category}/${v.data.id}${AppPaths.Questions}`)
//   }else if(v.key === 'delete'){
//     store.elementId = v.data.id
//     store._delete()
//   }else if(v.key==='edit'){
//     store.elementId = v.data.id
//     store.payload.name = v.data.name
//     store.visibleType = false
//     store.visible= true
//   }
// }

const goPush = () => {
  router.push({
    name: 'solve_exam',
    params: {
      exam_id: 2
    }
  })
}

const downloadFile = (file)=>{
  let a = document.createElement('a')
  a.href=file.file
  a.target='_blank'
  a.click()
  a.remove()
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div v-if="store.list.length>0" class="w-full overflow-x-auto flex flex-col gap-5">
      <div v-for="(item, idx) in store.list" :key="idx" class="flex flex-col gap-2 rounded-lg p-4 bg-surface-section">
        <!--          <n-divider v-if="idx!==0" class="!my-2" />-->
        <div>
          <n-button size="large" text type="info">
            <template #icon>
              <n-icon :component="HatGraduation12Filled"/>
            </template>
            <span>{{ $t('examPage.exam') }}: {{ item.name }}</span>
          </n-button>
        </div>
        <n-collapse v-if="item.topic.files.length">
          <n-collapse-item :title="$t('examPage.resources')">
            <div v-for="(file, idx) in item.topic.files" :key="idx">
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
        <div class="flex items-center gap-3">
          <n-button dashed size="tiny" type="primary">{{ $t('examPage.topic') }}: {{ item.topic.name }}</n-button>
          <n-button
              dashed
              size="tiny"
              type="error">
            {{ Utils.timeWithMonth(item.deadline) }}
            <template #icon>
              <n-icon :component="ClockAlarm32Filled"/>
            </template>
          </n-button>
          <n-button dashed size="tiny" type="success">
            {{ item.topic.type.name }}
          </n-button>

        </div>
      </div>

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
