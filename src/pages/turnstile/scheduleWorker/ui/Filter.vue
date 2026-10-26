<script setup>
  import { useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { Search20Regular } from '@vicons/fluent'
  import MonthTab from './MonthTab.vue'

  // Qidiruv brauzerda (Table.vue `visibleList`) — so'rov yuborilmaydi.
  const store = useScheduleGroupWorkerStore()

  const onChangeMonth = () => {
    store.params.page = 1
    store._dayOfMonth(() => {
      store._index()
    })
  }
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center gap-3">
    <n-input
      v-model:value="store.params.search"
      clearable
      class="md:w-[264px]! shrink-0"
      :placeholder="$t('content.search')"
    >
      <template #prefix>
        <n-icon size="16" class="text-secondary"><Search20Regular /></n-icon>
      </template>
    </n-input>
    <MonthTab
      v-if="store.selectedDate"
      class="flex-1 min-w-0"
      :options="store.monthsList"
      v-model:date="store.selectedDate"
      @update:date="onChangeMonth"
    />
  </div>
</template>
