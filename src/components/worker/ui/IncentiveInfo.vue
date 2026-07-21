<script setup>
  import { Trophy24Filled } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import InfoBox from './shared/InfoBox.vue'
  import Utils from '../../../utils/Utils.js'

  const store = useComponentStore()
</script>

<template>
  <div>
    <SectionHeader :title="$t('workerView.tabs.incentive')" :icon="Trophy24Filled">
      <div v-if="store.workerPreview?.worker?.incentives?.length" class="flex flex-col gap-4">
        <div
          v-for="(item, idx) in store.workerPreview?.worker?.incentives"
          :key="idx"
          class="bg-surface-section border border-surface-line rounded-lg p-4"
        >
          <n-tooltip trigger="hover" :style="{ maxWidth: '300px' }">
            <template #trigger>
              <div class="font-semibold text-lg text-primary truncate-text cursor-pointer mb-3">
                {{ item.gift }}
              </div>
            </template>
            {{ item.gift }}
          </n-tooltip>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoBox :label="$t('content.date')" :value="Utils.timeOnlyDate(item.date)" />
            <InfoBox :label="$t('content.organization')">
              <template #value>
                <n-tooltip trigger="hover" :style="{ maxWidth: '300px' }">
                  <template #trigger>
                    <span class="truncate-text cursor-pointer block">{{ item.organization?.name }}</span>
                  </template>
                  {{ item.organization?.name }}
                </n-tooltip>
              </template>
            </InfoBox>
            <InfoBox :label="$t('incentive.form.who')" :value="item.by_whom" />
            <InfoBox :label="$t('content.number')" :value="item.number" />
            <InfoBox :label="$t('incentive.form.reason')" :value="item.reason" class="md:col-span-2" />
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
