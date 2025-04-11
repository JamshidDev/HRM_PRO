<script setup>
import {NoDataPicture, UIPagination} from "@/components/index.js"
import {useWorkerExamStore} from "@/store/modules/index.js"
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
        <div class="grid grid-cols-[repeat(auto-fill,minmax(330px,345px))] gap-2">
          <template v-for="(lesson, idx) in store.list" :key="idx">
            <div
                :class="{'active-lesson': store?.elementId===lesson.id}"
                class="rounded-md transition-all cursor-pointer lesson-card  flex flex-col"
                @click="store.selectedLesson = lesson"
            >
              <div class="p-2">
                <p class="text-lg font-semibold">
                  {{ lesson.name }}
                </p>
              </div>
              <n-divider class="!my-1" />
              <n-button-group size="small" class="p-2">
                <n-button :type="TopicUtils.getMediaProperty(TopicUtils.EXAM).type" tertiary>
                  <template #icon>
                    <n-icon :color="TopicUtils.getMediaProperty(TopicUtils.EXAM).color"
                            :component="TopicUtils.getMediaProperty(TopicUtils.EXAM).icon"/>
                  </template>
                  <span class="font-bold">{{ lesson.exams.length }}</span>
                </n-button>
                <n-button :type="TopicUtils.getMediaProperty(TopicUtils.RESOURCE).type" tertiary>
                  <template #icon>
                    <n-icon :color="TopicUtils.getMediaProperty(TopicUtils.RESOURCE).color"
                            :component="TopicUtils.getMediaProperty(TopicUtils.RESOURCE).icon"/>
                  </template>
                  <span class="font-bold">{{ lesson.files.reduce((prev, curr) => prev + curr.items.length, 0) }}</span>
                </n-button>
                <n-button type="warning" tertiary>
                  {{ lesson.type.name }}
                </n-button>
              </n-button-group>
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
<style lang="scss" scoped>
.lesson-card {
  background: rgba(31, 65, 174, 0.04);

  &:hover {
    background: rgba(31, 65, 174, 0.09);
  }
}

.active-lesson {
  background: #2357ed1a;
}
</style>