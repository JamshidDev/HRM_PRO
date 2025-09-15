<script setup>
import {UIPageContent} from "@/components/index.js"
import {useTeacherLessonStore} from "@/store/modules/index.js"

import Filter from "./ui/Filter.vue"
import Calendar from "./ui/Calendar.vue"

const store = useTeacherLessonStore()

onMounted(()=>{
  const now = new Date()
  store.params.year = now.getFullYear()
  store.params.month = now.getMonth()+1
  store.currentTime = now.getTime() || null
  store._index()
})

</script>

<template>
  <UIPageContent>
    <Filter/>
    <Calendar/>
  </UIPageContent>
</template>
