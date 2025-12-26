<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useListenerStore } from '@/store/modules/index.js'
  import Calendar from './ui/Calendar.vue'

  const store = useListenerStore()

  onMounted(() => {
    const now = new Date()
    store.params.year = now.getFullYear()
    store.params.month = now.getMonth() + 1
    store.currentTime = now.getTime() || null
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Calendar />
  </UIPageContent>
</template>
