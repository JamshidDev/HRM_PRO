<script setup>
  import { useAccountStore, useComponentStore, useLmsLessonStore } from '@/store/modules/index.js'
  import { UIPageFilter } from '@/components/index.js'
  const store = useLmsLessonStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  // Ilgari `admin` tekshirilardi — LMS natijalarini ko'rish uchun admin bo'lish
  // shart emas. Backend'da `lms-result*` slug'i yo'q, shuning uchun navigations.js
  // bilan bir xil — LMS modulining o'zi (`lms` yoki `lms-read`).
  const filterEvent = () => {
    if (!accStore.canView(accStore.pn.lms)) return
    store.resultParams.page = 1
    store._resultIndex()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.resultParams.search"
    :search-loading="store.resultLoading"
    @onSearch="filterEvent"
    :show-filter-button="false"
    :show-add-button="false"
  >
  </UIPageFilter>
</template>
