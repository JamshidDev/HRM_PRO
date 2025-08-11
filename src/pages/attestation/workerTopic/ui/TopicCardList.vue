<script setup>
import {NoDataPicture, UIPagination} from "@/components/index.js"
import {useWorkerExamStore} from "@/store/modules/index.js"
import {TopicUtils} from "@/pages/attestation/Utils/index.js";
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

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

let timeout = null
const selectLesson = (v)=>{
  if(!accStore.checkAction(accStore.pn.examExamsRead)) return
  store.selectedLesson = v

  clearTimeout(timeout)
  timeout = setTimeout(()=>{
   document.getElementById('mainContent').scrollTo({
     top: document.body.scrollHeight,
     behavior: 'smooth'
   })
 },200)
}

</script>

<template>
  <n-spin :show="store.loading" class="h-full rounded-md p-1">
    <div class="h-full flex flex-col">
      <div v-if="store.list.length>0" class="overflow-y-auto grow basis-auto lg:p-4 p-2">
        <div class="grid grid-cols-12 gap-2">
          <template v-for="(lesson, idx) in store.list" :key="idx">
            <div
                :class="['active-lesson' && store?.elementId===lesson.id, `bg-gradient-card-${(idx%5) + 1}`]"
                class="rounded-2xl lg:col-span-3 md:col-span-6 col-span-12 transition-all cursor-pointer lesson-card  flex flex-col text-white p-2"
                @click="()=>selectLesson(lesson)"
            >
              <div class="p-2">
                <p class="text-lg font-semibold line-clamp-1">
                  {{ lesson.name }}
                </p>
              </div>
              <n-divider class="my-1!" />
              <div class="flex justify-between">
                <n-button type="error" tertiary>
                  <template #icon>
                    <component class="text-white" :is="TopicUtils.getMediaProperty(TopicUtils.EXAM).icon" />
                  </template>
                  <span class="font-bold text-white">{{ lesson.exams.length }}</span>
                </n-button>
                <n-button type="default" tertiary>
                  <template #icon>
                    <component class="text-white" :is="TopicUtils.getMediaProperty(TopicUtils.RESOURCE).icon"/>
                  </template>
                  <span class="font-bold text-white">{{ lesson.files.reduce((prev, curr) => prev + curr.items.length, 0) }}</span>
                </n-button>
              </div>
              <p class="line-clamp-1">
                {{ lesson.type.name }}
              </p>
            </div>
          </template>
        </div>
      </div>
      <UIPagination
          v-if="store.totalItems>0 && !store.loading"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          class="mt-auto shrink-0"
          @change-page="changePage"
      />
      <NoDataPicture v-if="store.list.length===0 && !store.loading"/>
    </div>

  </n-spin>
</template>