<script setup>
  import dayjs from 'dayjs'
  import { WeatherSunny20Filled, Clock20Filled } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import InfoBox from './shared/InfoBox.vue'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'
  import CalendarArrowUpIcon from '@/assets/icons/calendarArrowUpIcon.svg'
  import CalendarArrowDownIcon from '@/assets/icons/calendarArrowDownIcon.svg'

  const store = useComponentStore()

  const isCompleted = (item) => item.to && dayjs(item.to).isBefore(dayjs(), 'day')
</script>

<template>
  <div class="flex flex-col gap-4">
    <SectionHeader :title="$t('workerView.tabs.vacation')" :icon="WeatherSunny20Filled">
      <div v-if="store.workerPreview?.vacations?.length" class="flex flex-col gap-4">
        <div
          v-for="(item, idx) in store.workerPreview?.vacations"
          :key="idx"
          class="bg-surface-ground rounded-3xl p-5"
        >
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <span class="font-semibold text-textColor0">
              {{ $t('workerView.vacation.upcomingTitle', { year: dayjs(item.from).year() }) }}
            </span>
            <UIBadge
              :label="isCompleted(item) ? $t('workerView.vacation.completed') : $t('workerView.vacation.planned')"
              :type="isCompleted(item) ? Utils.colorTypes.secondary : Utils.colorTypes.info"
              :show-icon="false"
              class="!w-auto"
            />
          </div>

          <div class="border-t border-surface-line my-4" />

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoBox
              :icon="Clock20Filled"
              icon-variant="inline"
              size="large"
              surface="transparent"
              :label="$t('workerView.vacation.duration')"
            >
              <template #value>
                <span class="text-[#AB7D00]">{{ item.all_day }} {{ $t('workerView.vacation.daysLabel') }}</span>
              </template>
            </InfoBox>
            <InfoBox
              :icon="CalendarArrowUpIcon"
              icon-variant="inline"
              size="large"
              surface="transparent"
              :label="$t('workerView.vacation.start')"
              :value="Utils.timeOnlyDate(item.from)"
            />
            <InfoBox
              :icon="CalendarArrowDownIcon"
              icon-variant="inline"
              size="large"
              surface="transparent"
              :label="$t('workerView.vacation.end')"
              :value="Utils.timeOnlyDate(item.to)"
            />
            <InfoBox
              :icon="WeatherSunny20Filled"
              icon-variant="inline"
              size="large"
              surface="transparent"
              :label="$t('workerView.vacation.type')"
              :value="item.type?.name"
            />
          </div>
        </div>
      </div>
      <span v-else class="w-full text-center text-sm inline-block text-textColor3">
        {{ $t('content.no-data') }}
      </span>
    </SectionHeader>
  </div>
</template>
