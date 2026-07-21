<script setup>
  import dayjs from 'dayjs'
  import { Doctor20Regular, HeartPulse24Filled } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import InfoBox from './shared/InfoBox.vue'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'
  import i18n from '@/i18n/index.js'

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

  const monthsLeft = (item) => {
    if (!item.to) return ''
    const count = Math.max(dayjs(item.to).diff(dayjs(), 'month'), 0)
    return t('workerView.med.monthsLeft', { count })
  }
</script>

<template>
  <div class="pt-4">
    <SectionHeader :title="$t('medPage.name')" :icon="Doctor20Regular">
      <div v-if="store.workerPreview?.meds?.length" class="flex flex-col gap-4">
        <div
          v-for="(item, idx) in store.workerPreview?.meds"
          :key="idx"
          class="bg-surface-section border border-surface-line rounded-lg p-4"
        >
          <div class="flex items-center justify-end mb-3">
            <UIBadge
              :label="item.status?.name"
              :type="Utils.colorTypes.success"
              :show-icon="false"
              class="!w-auto"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-success/5 rounded-lg p-4 relative overflow-hidden">
              <n-icon size="64" class="absolute -right-2 -bottom-2 text-success/10">
                <HeartPulse24Filled />
              </n-icon>
              <div class="text-xs text-textColor3 mb-1">{{ $t('workerView.med.currentStatus') }}</div>
              <div class="text-success font-bold text-lg">{{ item.status?.name }}</div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-textColor3">{{ $t('workerView.med.validityPeriod') }}</span>
                <span class="text-primary text-sm font-semibold">
                  {{ progressPercent(item) }}% {{ $t('workerView.med.progressSuffix') }}
                </span>
              </div>
              <n-progress
                type="line"
                status="success"
                :show-indicator="false"
                :percentage="progressPercent(item)"
              />
              <div class="flex items-center justify-between mt-2 text-xs text-textColor3">
                <span>{{ $t('workerView.med.started') }}: {{ Utils.timeOnlyDate(item.from) }}</span>
                <span>{{ $t('workerView.med.ends') }}: {{ Utils.timeOnlyDate(item.to) }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InfoBox :label="$t('workerView.med.lastCheckDate')" :value="Utils.timeOnlyDate(item.from)" />
            <InfoBox :label="$t('workerView.med.validityPeriod')">
              <template #value>
                <div>{{ Utils.timeOnlyDate(item.to) }}</div>
                <div class="text-xs text-textColor3 font-normal">{{ monthsLeft(item) }}</div>
              </template>
            </InfoBox>
            <InfoBox :label="$t('workerView.med.conclusion')">
              <template #value>
                <div class="text-success">{{ item.status?.name }}</div>
                <!-- TODO: backend'da alohida "mehnatga layoqatlilik" maydoni yo'q -->
                <div class="text-xs text-textColor3 font-normal">
                  {{ $t('workerView.med.fitForWork') }}
                </div>
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
