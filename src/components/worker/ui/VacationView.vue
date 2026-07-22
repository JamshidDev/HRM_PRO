<script setup>
  import dayjs from 'dayjs'
  import { WeatherSunny20Filled } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import MiniCalendar from './shared/MiniCalendar.vue'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'
  import CalendarIcon from '@/assets/icons/calendarIcon.svg'

  const store = useComponentStore()

  const isCompleted = (item) => item.to && dayjs(item.to).isBefore(dayjs(), 'day')
</script>

<template>
  <div>
    <SectionHeader :title="$t('workerView.tabs.vacation')" :icon="WeatherSunny20Filled">
      <div v-if="store.workerPreview?.vacations?.length" class="flex flex-col">
        <div
          v-for="(item, idx) in store.workerPreview?.vacations"
          :key="idx"
          class="py-4"
          :class="idx !== 0 ? 'border-t border-surface-line' : 'pt-0'"
        >
          <div class="flex items-center gap-2 flex-wrap mb-3">
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

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
                <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                  <n-icon size="14"><CalendarIcon /></n-icon>
                  {{ $t('workerView.vacation.duration') }}
                </div>
                <div class="font-semibold text-amber-600">
                  {{ item.all_day }} {{ $t('workerView.vacation.daysLabel') }}
                </div>
              </div>
              <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
                <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                  <n-icon size="14"><CalendarIcon /></n-icon>
                  {{ $t('workerView.vacation.start') }}
                </div>
                <div class="font-semibold text-textColor0">{{ Utils.timeOnlyDate(item.from) }}</div>
              </div>
              <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
                <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                  <n-icon size="14"><WeatherSunny20Filled /></n-icon>
                  {{ $t('workerView.vacation.type') }}
                </div>
                <div class="font-semibold text-textColor0">{{ item.type?.name }}</div>
              </div>
              <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
                <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                  <n-icon size="14"><CalendarIcon /></n-icon>
                  {{ $t('workerView.vacation.end') }}
                </div>
                <div class="font-semibold text-textColor0">{{ Utils.timeOnlyDate(item.to) }}</div>
              </div>
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
