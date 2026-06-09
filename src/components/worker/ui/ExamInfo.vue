<script setup>
  import {
    QuizNew24Filled,
    CalendarLtr32Regular,
    Clock24Regular,
    Star24Regular,
    BookOpen24Regular,
    Tag24Regular
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
            <QuizNew24Filled />
          </n-icon>
          {{ $t('workerView.tabs.exams') }}
        </span>
      </div>
      <div class="col-span-12">
        <template v-for="(item, idx) in store.workerPreview?.worker?.exams" :key="idx">
          <div
            class="grid grid-cols-12 border border-surface-line rounded-lg px-4 py-2 border-dashed mb-2"
          >
            <div class="col-span-12 mb-2">
              <n-tooltip trigger="hover" :style="{ maxWidth: '300px' }">
                <template #trigger>
                  <span class="font-medium text-lg text-primary truncate-text cursor-pointer">{{ item.exam?.name }}</span>
                </template>
                {{ item.exam?.name }}
              </n-tooltip>
            </div>
            <div class="col-span-8 flex items-center text-textColor3">
              <n-icon size="18" class="text-primary mr-1">
                <BookOpen24Regular />
              </n-icon>
              {{ $t('examPage.topic') }}
            </div>
            <div class="col-span-4 text-end font-medium">
              <n-tooltip trigger="hover" :style="{ maxWidth: '300px' }">
                <template #trigger>
                  <span class="truncate-text cursor-pointer">{{ item.topic?.name }}</span>
                </template>
                {{ item.topic?.name }}
              </n-tooltip>
            </div>
            <div class="col-span-8 text-textColor3 flex items-center">
              <n-icon size="18" class="text-primary mr-1">
                <Tag24Regular />
              </n-icon>
              {{ $t('content.type') }}
            </div>
            <div class="col-span-4 text-end font-medium">
              <n-tooltip trigger="hover" :style="{ maxWidth: '300px' }">
                <template #trigger>
                  <span class="truncate-text cursor-pointer">{{ item.topic?.type?.name }}</span>
                </template>
                {{ item.topic?.type?.name }}
              </n-tooltip>
            </div>
            <div class="col-span-8 text-textColor3 flex items-center">
              <n-icon size="18" class="text-primary mr-1">
                <CalendarLtr32Regular />
              </n-icon>
              {{ $t('examPage.startTime') }}
            </div>
            <div class="col-span-4 text-end font-medium truncate-text">
              {{ Utils.timeOnlyDate(item.created) }} {{ Utils.timeOnlyHour(item.created) }}
            </div>
            <div class="col-span-8 text-textColor3 flex items-center">
              <n-icon size="18" class="text-primary mr-1">
                <Clock24Regular />
              </n-icon>
              {{ $t('examPage.endTime') }}
            </div>
            <div class="col-span-4 text-end font-medium truncate-text">
              {{ Utils.timeOnlyDate(item.ended) }} {{ Utils.timeOnlyHour(item.ended) }}
            </div>
            <div class="col-span-8 text-textColor3 flex items-center">
              <n-icon size="18" class="text-primary mr-1">
                <Star24Regular />
              </n-icon>
              {{ $t('examPage.result') }}
            </div>
            <div class="col-span-4 text-end font-medium text-primary truncate-text">
              {{ item.result }} / {{ item.exam?.tests_count }}
            </div>
          </div>
        </template>
        <template v-if="!store.workerPreview?.worker?.exams || store.workerPreview?.worker?.exams.length === 0">
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
