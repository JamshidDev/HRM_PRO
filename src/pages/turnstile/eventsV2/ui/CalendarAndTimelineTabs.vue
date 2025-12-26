<script setup>
  import Calendar from './Calendar.vue'
  import Timeline from './Timeline.vue'
  import { useEventV2Store } from '@/store/modules/index.js'

  const store = useEventV2Store()
</script>

<template>
  <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
    <n-tab-pane :name="store.tabs[0]">
      <Calendar />
    </n-tab-pane>
    <n-tab-pane :name="store.tabs[1]">
      <Timeline />
    </n-tab-pane>
  </n-tabs>
</template>
