<script setup>
  import dayjs from 'dayjs'
  import { WeatherSunny20Filled } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import VacationCalendarModal from './shared/VacationCalendarModal.vue'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'
  import CalendarIcon from '@/assets/icons/calendarIcon.svg'

  const store = useComponentStore()

  const isCompleted = (item) => item.to && dayjs(item.to).isBefore(dayjs(), 'day')

  const calendarItem = ref(null)
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
          <div class="flex items-center justify-between gap-2 flex-wrap mb-3">
            <div class="flex items-center gap-2 flex-wrap">
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
            <span
              class="text-primary text-sm font-medium cursor-pointer shrink-0"
              @click="calendarItem = item"
            >
              {{ $t('workerView.vacation.viewCalendar') }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        </div>
      </div>
      <span v-else class="w-full text-center text-sm inline-block text-textColor3">
        {{ $t('content.no-data') }}
      </span>
    </SectionHeader>

    <VacationCalendarModal
      :show="!!calendarItem"
      :from="calendarItem?.from"
      :to="calendarItem?.to"
      @update:show="(value) => !value && (calendarItem = null)"
    />
  </div>
</template>
