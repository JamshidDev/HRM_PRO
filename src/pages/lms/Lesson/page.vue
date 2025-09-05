<script setup>
import {useLmsLessonStore, useComponentStore} from "@/store/modules/index.js"
import Calendar from "./ui/Calendar.vue"
import Filter from "./ui/Filter.vue"
import createFrom from "./ui/createForm.vue"
import Preview from "./ui/Preview.vue"
import {UIModal, UIPageContent} from "@/components/index.js"

const store = useLmsLessonStore()
const componentStore = useComponentStore()



onMounted(()=>{
  const now = new Date()
  store.params.year = now.getFullYear()
  store.params.month = now.getMonth()+1
  store.currentTime = now.getTime() || null
  componentStore._lmsLearningCenter(()=>{
    const existCenter = componentStore.lmsLearningCenters?.find(v=>v.id === store.params.learning_center_id)
    store.params.learning_center_id =existCenter? store.params.learning_center_id : componentStore.lmsLearningCenters?.[0].id
    store._index()
  })
})

</script>

<template>
  <UIPageContent>
    <Filter/>
    <Calendar/>
    <UIModal
        :width="900"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="$t('lessonPage.createTitle')"
    >
      <template #default>
        <createFrom/>
      </template>
    </UIModal>
  <UIModal
      :width="600"
      :visible="store.previewVisible"
      @update:visible="(v)=>store.previewVisible = v"
      :title="$t('lessonPage.previewTitle')"
  >
    <template #default>
      <Preview/>
    </template>
  </UIModal>
  </UIPageContent>
</template>