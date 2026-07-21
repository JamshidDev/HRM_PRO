<script setup>
  import dayjs from 'dayjs'
  import { HeartPulse24Filled, PersonCircle20Filled, ShieldCheckmark20Filled, CheckmarkCircle20Filled } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import InfoBox from './shared/InfoBox.vue'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import MedicalExaminationIcon from '@/assets/icons/medicalExaminationIcon.svg'

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
  <div>
    <SectionHeader :title="$t('medPage.name')" :icon="MedicalExaminationIcon" icon-chip>
      <template #title-suffix>
        <UIBadge
          v-if="store.workerPreview?.meds?.[0]?.status?.name"
          :label="store.workerPreview?.meds?.[0]?.status?.name"
          :type="Utils.colorTypes.success"
          :show-icon="false"
          class="!w-auto"
        />
      </template>

      <div v-if="store.workerPreview?.meds?.length" class="flex flex-col gap-6">
        <div v-for="(item, idx) in store.workerPreview?.meds" :key="idx">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-success/5 rounded-3xl p-4 relative overflow-hidden">
              <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <n-icon size="110" class="text-success/10">
                  <HeartPulse24Filled />
                </n-icon>
              </div>
              <div class="relative text-xs text-textColor3 mb-1">{{ $t('workerView.med.currentStatus') }}</div>
              <div class="relative text-success font-bold text-2xl">{{ item.status?.name }}</div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-textColor0">{{ $t('workerView.med.validityPeriod') }}</span>
                <span class="text-primary text-xs font-semibold bg-primary/10 rounded-full px-3 py-1">
                  {{ progressPercent(item) }}% {{ $t('workerView.med.progressSuffix') }}
                </span>
              </div>
              <n-progress
                type="line"
                status="success"
                :show-indicator="false"
                :percentage="progressPercent(item)"
              />
              <div class="flex items-center justify-between mt-3">
                <div>
                  <div class="text-xs text-textColor3 mb-1">{{ $t('workerView.med.started') }}</div>
                  <div class="font-semibold text-textColor0">{{ Utils.timeOnlyDate(item.from) }}</div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-textColor3 mb-1">{{ $t('workerView.med.ends') }}</div>
                  <div class="font-semibold text-textColor0">{{ Utils.timeOnlyDate(item.to) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InfoBox
              :icon="PersonCircle20Filled"
              :label="$t('workerView.med.lastCheckDate')"
              :value="Utils.timeOnlyDate(item.from)"
            />
            <InfoBox :icon="ShieldCheckmark20Filled" :label="$t('workerView.med.validityPeriod')">
              <template #value>
                <div>{{ Utils.timeOnlyDate(item.to) }}</div>
                <div class="text-xs text-textColor3 font-normal">{{ monthsLeft(item) }}</div>
              </template>
            </InfoBox>
            <InfoBox :icon="CheckmarkCircle20Filled" :label="$t('workerView.med.conclusion')">
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
