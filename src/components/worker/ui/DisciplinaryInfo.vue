<script setup>
  import {
    Warning24Filled,
    CalendarLtr32Regular,
    Building24Regular,
    DocumentText24Regular,
    Document24Regular
  } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import Utils from '../../../utils/Utils.js'

  const store = useComponentStore()
</script>

<template>
  <template v-if="store.workerPreview?.worker">
    <div class="grid grid-cols-12">
      <div class="col-span-12 mt-6">
        <span class="font-medium text-primary mb-2 uppercase flex items-center">
          <n-icon size="18" class="text-primary mr-1">
            <Warning24Filled />
          </n-icon>
          {{ $t('workerView.tabs.punishment') }}
        </span>
      </div>
      <div class="col-span-12">
        <template v-for="(item, idx) in store.workerPreview?.worker?.disciplinary_actions" :key="idx">
          <div
            class="grid grid-cols-12 border border-surface-line rounded-lg px-4 py-2 border-dashed mb-2"
          >
            <div class="col-span-12 mb-2">
              <n-tooltip trigger="hover" :style="{ maxWidth: '300px' }">
                <template #trigger>
                  <span class="font-medium text-lg text-primary truncate-text cursor-pointer">{{ item.fine }}</span>
                </template>
                {{ item.fine }}
              </n-tooltip>
            </div>
            <div class="col-span-8 flex items-center text-textColor3">
              <n-icon size="18" class="text-primary mr-1">
                <CalendarLtr32Regular />
              </n-icon>
              {{ $t('content.date') }}
            </div>
            <div class="col-span-4 text-end font-medium truncate-text">
              {{ Utils.timeOnlyDate(item.date) }}
            </div>
            <div class="col-span-8 text-textColor3 flex items-center">
              <n-icon size="18" class="text-primary mr-1">
                <Building24Regular />
              </n-icon>
              {{ $t('content.organization') }}
            </div>
            <div class="col-span-4 text-end font-medium">
              <n-tooltip trigger="hover" :style="{ maxWidth: '300px' }">
                <template #trigger>
                  <span class="truncate-text cursor-pointer">{{ item.organization?.name }}</span>
                </template>
                {{ item.organization?.name }}
              </n-tooltip>
            </div>
            <div class="col-span-8 text-textColor3 flex items-center">
              <n-icon size="18" class="text-primary mr-1">
                <Document24Regular />
              </n-icon>
              {{ $t('content.number') }}
            </div>
            <div class="col-span-4 text-end font-medium truncate-text">
              {{ item.number }}
            </div>
            <div class="col-span-8 text-textColor3 flex items-center">
              <n-icon size="18" class="text-primary mr-1">
                <DocumentText24Regular />
              </n-icon>
              {{ $t('incentive.form.reason') }}
            </div>
            <div class="col-span-4 text-end font-medium">
              <n-tooltip trigger="hover" :style="{ maxWidth: '300px' }">
                <template #trigger>
                  <span class="truncate-text cursor-pointer">{{ item.reason }}</span>
                </template>
                {{ item.reason }}
              </n-tooltip>
            </div>
          </div>
        </template>
        <template v-if="!store.workerPreview?.worker?.disciplinary_actions || store.workerPreview?.worker?.disciplinary_actions.length === 0">
          <span class="w-full text-center text-sm inline-block text-textColor3">{{
            $t('content.no-data')
          }}</span>
        </template>
      </div>
    </div>
  </template>
</template>

<style scoped>
.truncate-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
