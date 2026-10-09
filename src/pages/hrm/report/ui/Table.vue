<script setup>
  import { NoDataPicture } from '@/components/index.js'
  import { useReport2Store } from '@/store/modules/index.js'
  import TableView from './TableView.vue'

  const store = useReport2Store()
</script>

<template>
  <div class="w-full bg-surface-section rounded-[20px] p-1">
    <n-spin :show="store.department.loading">
      <TableView v-if="store.department.list.length > 0" />
      <NoDataPicture v-else />
    </n-spin>
  </div>
</template>
