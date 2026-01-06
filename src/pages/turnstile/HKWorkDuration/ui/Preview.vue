<script setup>
  import { useHKWorkDurationStore } from '@/store/modules/index.js'
  import { Calendar, TimeLine } from './index.js'

  const store = useHKWorkDurationStore()
</script>
<template>
  <n-spin :show="store.previewLoading">
    <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
      <n-tab-pane :name="1">
        <Calendar />
      </n-tab-pane>
      <n-tab-pane :name="2">
        <TimeLine />
      </n-tab-pane>
    </n-tabs>
  </n-spin>
</template>
