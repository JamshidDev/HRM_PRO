<script setup>
  import { useScheduleTableStore } from '@/store/modules/index.js'
  import { UIDrawer } from '@/components/index.js'

  const store = useScheduleTableStore()
</script>

<template>
  <UIDrawer
    class="hidden-drawer-header"
    :mask-closable="false"
    :placement="'bottom'"
    :height="300"
    v-model:visible="store.savingVisible"
    :hide-header="true"
  >
    <template #content>
      <div class="grid grid-cols-12 mx-auto max-w-[800px] pt-10">
        <div class="col-span-12 flex items-center gap-2">
          <span>{{ $t('schedule.form.allScheduleCount') }}</span>
          <span class="flex-1 border-b border-dashed border-surface-line"></span>
          <span>{{ store.workerList.length }}</span>
        </div>
        <div class="col-span-12 flex items-center gap-2">
          <span>{{ $t('schedule.form.changedScheduleCount') }}</span>
          <span class="flex-1 border-b border-dashed border-surface-line"></span>
          <span>{{ store.readyToSaveCount }}</span>
        </div>
        <div class="col-span-12 mt-6">
          <n-progress
            type="line"
            :percentage="store.savingPercent"
            indicator-placement="inside"
            processing
          />
        </div>
        <div class="col-span-12 flex justify-center pt-4">
          <span class="text-xs text-secondary">{{ $t('schedule.form.savingProcess') }}</span>
        </div>
      </div>
    </template>
  </UIDrawer>
</template>
