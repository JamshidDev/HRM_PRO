<script setup>
  import { computed } from 'vue'
  import dayjs from 'dayjs'
  import { HeartPulse24Filled } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import Utils from '../../../utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import MonitorHeartRateIcon from '@/assets/icons/monitorHeartRate.svg'

  const { t } = i18n.global
  const store = useComponentStore()

  const progressPercent = (item) => {
    if (!item.from || !item.to) return 0
    const start = dayjs(item.from)
    const end = dayjs(item.to)
    const now = dayjs()
    if (end.isBefore(start)) return 0
    const total = end.diff(start)
    if (!total) return 0
    const elapsed = Math.min(Math.max(now.diff(start), 0), total)
    return Math.round((elapsed / total) * 100)
  }

  const endTime = (item) => (item?.to ? dayjs(item.to).valueOf() : 0)
  const byEndDesc = (a, b) => endTime(b) - endTime(a)

  // Tugash sanasi inclusive: bugun tugaydigan ko'rik ham hali amalda hisoblanadi
  const isValid = (item) => item?.to && !dayjs(item.to).isBefore(dayjs(), 'day')

  // Muddati tugamaganlar ichidan eng oxirgisi — ro'yxat boshida rangli ko'rsatiladi
  const activeMed = computed(
    () => (store.workerPreview?.meds ?? []).filter(isValid).sort(byEndDesc)[0] ?? null
  )

  // Avval amaldagi ko'rik, keyin qolganlari (muddati o'tganlari) — yangisidan eskisiga
  const orderedMeds = computed(() => {
    const rest = (store.workerPreview?.meds ?? [])
      .filter((v) => v !== activeMed.value)
      .sort(byEndDesc)
    return activeMed.value ? [activeMed.value, ...rest] : rest
  })

  const isActive = (idx) => idx === 0 && !!activeMed.value

  const durationLabel = (item) => {
    if (!item.from || !item.to) return ''
    const start = dayjs(item.from)
    const end = dayjs(item.to)
    if (end.isBefore(start)) return ''
    const years = end.diff(start, 'year')
    if (years >= 1) return t('workerView.med.durationYears', { count: years })
    return t('workerView.med.durationMonths', { count: end.diff(start, 'month') })
  }
</script>

<template>
  <div class="flex flex-col gap-4">
    <SectionHeader :title="$t('medPage.name')" :icon="MonitorHeartRateIcon">
      <div v-if="orderedMeds.length" class="flex flex-col gap-3">
        <template v-for="(item, idx) in orderedMeds" :key="idx">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              class="md:col-span-1 rounded-3xl p-4 relative overflow-hidden"
              :class="isActive(idx) ? 'bg-success/5' : 'bg-surface-ground'"
            >
              <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <n-icon size="110" :class="isActive(idx) ? 'text-success/10' : 'text-textColor3/10'">
                  <HeartPulse24Filled />
                </n-icon>
              </div>
              <div class="relative h-full flex flex-col justify-center">
                <div v-if="isActive(idx)" class="text-xs text-textColor3 mb-1">
                  {{ $t('workerView.med.currentStatus') }}
                </div>
                <div
                  class="font-bold text-2xl"
                  :class="isActive(idx) ? 'text-success' : 'text-textColor0'"
                >
                  {{ item.status?.name }}
                </div>
              </div>
            </div>

            <div class="md:col-span-2 flex flex-col justify-center">
              <div v-if="isActive(idx)" class="flex items-center justify-between mb-2">
                <span class="text-textColor0">{{ $t('workerView.med.validityPeriod') }}</span>
                <span
                  v-if="durationLabel(item)"
                  class="text-primary text-xs font-semibold bg-primary/10 rounded-full px-3 py-1"
                >
                  {{ durationLabel(item) }}
                </span>
              </div>
              <n-progress
                v-if="isActive(idx)"
                type="line"
                status="success"
                :show-indicator="false"
                :percentage="progressPercent(item)"
              />
              <div class="flex items-center justify-between" :class="isActive(idx) && 'mt-3'">
                <div>
                  <div class="text-xs text-textColor3 mb-1">{{ $t('workerView.med.started') }}</div>
                  <div class="font-semibold text-textColor0">{{ Utils.timeOnlyDate(item.from) }}</div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-textColor3 mb-1">
                    {{ isActive(idx) ? $t('workerView.med.ends') : $t('workerView.med.ended') }}
                  </div>
                  <div class="font-semibold text-textColor0">{{ Utils.timeOnlyDate(item.to) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="isActive(idx) && orderedMeds.length > 1"
            class="border-t border-surface-line"
          />
        </template>
      </div>
      <span v-else class="w-full text-center text-sm inline-block text-textColor3">
        {{ $t('content.no-data') }}
      </span>
    </SectionHeader>
  </div>
</template>
