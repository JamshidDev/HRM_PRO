<script setup>
import {NoDataPicture, UIPagination} from "@/components/index.js"
import {useExamAttemptStore, useWorkerExamStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import {
  Book24Filled,
  Bookmark32Filled,
  DocumentOnePage24Filled,
  HatGraduation12Filled,
  Image48Filled,
  MusicNote224Filled,
  VideoClip24Filled
} from "@vicons/fluent";
import {TopicUtils} from "@/pages/lms/Utils/index.js";

const store = useWorkerExamStore()



const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}


let colors = ref(["primary", "success", "warning", "info"])
const randomColors = ref(['', '', ''])
onMounted(() => {
  for (let i = 0; i < 3; i++) {
    let rand = Math.floor(Math.random() * colors.value.length)
    randomColors.value[i] = colors.value[rand]
    colors.value = colors.value.filter((i, idx) => idx !== rand);
  }
})

</script>

<template>
  <n-spin :show="store.loading" class="h-full rounded-md p-1">
    <div class="h-full flex flex-col">
      <div v-if="store.list.length>0" class="overflow-y-auto grow basis-auto">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">
          <template v-for="(lesson, idx) in store.list" :key="idx">
            <div
                class="rounded-md transition-all cursor-pointer lesson-card p-2 h-[90px] flex flex-col"
                :class="{'active-lesson': store?.elementId===lesson.id}"
                @click="store.selectedLesson = lesson"
            >
              <div class="flex items-center gap-3 justify-between">
                <p class="text-xl font-semibold">
                  {{ lesson.name }}
                </p>
                <n-button :type="randomColors[1]" dashed size="tiny">
                  {{ lesson.type.name }}
                </n-button>
              </div>
              <div class="flex gap-2  items-end grow">
                <template v-for="(item, idx) in [{id: 0, items: lesson.exams},...lesson.files]">
                  <n-button dashed size="tiny">
                    <template #icon>
                      <n-icon :component="TopicUtils.getMediaProperty(item.id).icon" :color="TopicUtils.getMediaProperty(item.id).color"/>
                    </template>
                    {{item.items.length}}
                  </n-button>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
      <UIPagination
          class="mt-auto shrink-0"
          v-if="store.totalItems>0 && !store.loading"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
      <NoDataPicture v-if="store.list.length===0 && !store.loading"/>
    </div>

  </n-spin>
</template>
<style scoped lang="scss">
.lesson-card{
  background: rgba(31, 65, 174, 0.04);
  &:hover{
    background: rgba(31, 65, 174, 0.09);
  }
}
.active-lesson{
  background: #2357ed1a;
}
</style>