<script setup>
  import dayjs from 'dayjs'
  import { WeatherSunny20Filled } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import InfoBox from './shared/InfoBox.vue'
  import MiniCalendar from './shared/MiniCalendar.vue'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'

  const store = useComponentStore()

  const isCompleted = (item) => item.to && dayjs(item.to).isBefore(dayjs(), 'day')
</script>

<template>
  <div class="pt-4">
    <SectionHeader :title="$t('workerView.tabs.vacation')" :icon="WeatherSunny20Filled">
      <div v-if="store.workerPreview?.vacations?.length" class="flex flex-col gap-4">
        <div
          v-for="(item, idx) in store.workerPreview?.vacations"
          :key="idx"
          class="bg-surface-section border border-surface-line rounded-lg p-4"
        >
          <div class="flex items-center justify-end mb-3">
            <UIBadge
              v-if="isCompleted(item)"
              :label="$t('workerView.vacation.completed')"
              :type="Utils.colorTypes.secondary"
              :show-icon="false"
              class="!w-auto"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoBox :label="$t('workerView.vacation.start')" :value="Utils.timeOnlyDate(item.from)" />
              <InfoBox :label="$t('workerView.vacation.end')" :value="Utils.timeOnlyDate(item.to)" />
              <InfoBox
                :label="$t('workerView.vacation.duration')"
                :value="`${item.all_day} ${$t('workerView.vacation.daysLabel')}`"
              />
              <InfoBox :label="$t('workerView.vacation.type')" :value="item.type?.name" />
            </div>
            <div class="md:col-span-1">
              <MiniCalendar :from="item.from" :to="item.to" />
            </div>
          </div>
        </div>
      </div>
      <span v-else class="w-full text-center text-sm inline-block text-textColor3">
        {{ $t('content.no-data') }}
      </span>
    </SectionHeader>
  </div>
</template>
