<script setup>
  import { QuizNew24Filled } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import InfoBox from './shared/InfoBox.vue'
  import Utils from '../../../utils/Utils.js'

  const store = useComponentStore()
</script>

<template>
  <div class="pt-4">
    <SectionHeader :title="$t('workerView.tabs.exams')" :icon="QuizNew24Filled">
      <div v-if="store.workerPreview?.worker?.exams?.length" class="flex flex-col gap-4">
        <div
          v-for="(item, idx) in store.workerPreview?.worker?.exams"
          :key="idx"
          class="bg-surface-section border border-surface-line rounded-lg p-4"
        >
          <n-tooltip trigger="hover" :style="{ maxWidth: '300px' }">
            <template #trigger>
              <div class="font-semibold text-lg text-primary truncate-text cursor-pointer mb-3">
                {{ item.exam?.name }}
              </div>
            </template>
            {{ item.exam?.name }}
          </n-tooltip>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoBox :label="$t('examPage.topic')">
              <template #value>
                <n-tooltip trigger="hover" :style="{ maxWidth: '300px' }">
                  <template #trigger>
                    <span class="truncate-text cursor-pointer block">{{ item.topic?.name }}</span>
                  </template>
                  {{ item.topic?.name }}
                </n-tooltip>
              </template>
            </InfoBox>
            <InfoBox :label="$t('content.type')" :value="item.topic?.type?.name" />
            <InfoBox
              :label="$t('examPage.startTime')"
              :value="`${Utils.timeOnlyDate(item.created)} ${Utils.timeOnlyHour(item.created)}`"
            />
            <InfoBox
              :label="$t('examPage.endTime')"
              :value="`${Utils.timeOnlyDate(item.ended)} ${Utils.timeOnlyHour(item.ended)}`"
            />
            <InfoBox :label="$t('examPage.result')" class="md:col-span-2">
              <template #value>
                <span class="text-primary">{{ item.result }} / {{ item.exam?.tests_count }}</span>
              </template>
            </InfoBox>
          </div>
        </div>
      </div>
      <span v-else class="w-full text-center text-sm inline-block text-textColor3">
        {{ $t('content.no-data') }}
      </span>
    </SectionHeader>
  </div>
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
