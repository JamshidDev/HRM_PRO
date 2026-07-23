<script setup>
  import { Settings24Regular, CalendarCheckmark20Filled } from '@vicons/fluent'
  import PositionIcon from '@/assets/icons/positionIcon.svg'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'

  const store = useComponentStore()
</script>

<template>
  <div>
    <SectionHeader :title="$t('oldCareerPage.systemTitle')" :icon="Settings24Regular">
      <div v-if="store.workerPreview?.worker?.new_careers?.length" class="flex flex-col gap-2">
        <div v-for="(item, idx) in store.workerPreview?.worker?.new_careers" :key="idx" class="flex gap-3">
          <div class="flex-1 min-w-0 bg-surface-ground-soft rounded-3xl px-5 py-4">
            <div class="flex items-center gap-2 flex-wrap">
              <div class="text-base font-bold text-textColor0">
                {{ Utils.timeOnlyYear(item?.from) }} —
                {{ Utils.timeOnlyYear(item?.to) || $t('content.untilNow') }}
              </div>
              <UIBadge
                v-if="!item?.to"
                :label="$t('workerView.career.currentLabel')"
                :type="Utils.colorTypes.success"
                :show-icon="false"
                class="!w-auto"
              />
            </div>
            <div class="text-textColor2 mt-1">
              {{ item.full_position }}
            </div>
          </div>
        </div>
      </div>
      <h4 v-else class="text-center text-secondary">
        {{ $t('content.no-data') }}
      </h4>
    </SectionHeader>

    <SectionHeader :title="$t('oldCareerPage.title')" :icon="PositionIcon">
      <div v-if="store.workerPreview?.worker?.old_careers?.length" class="flex flex-col">
        <div v-for="(item, idx) in store.workerPreview?.worker?.old_careers" :key="idx" class="flex gap-3">
          <div class="w-14 shrink-0 flex flex-col items-center">
            <span class="flex-1 w-0.5" :class="idx === 0 ? 'bg-transparent' : 'bg-surface-line'"></span>
            <span
              class="w-14 h-14 rounded-full bg-surface-ground-soft border border-surface-line flex items-center justify-center shrink-0"
            >
              <span class="w-8 h-8 rounded-full bg-gray-soft flex items-center justify-center">
                <n-icon size="18" class="text-white">
                  <CalendarCheckmark20Filled />
                </n-icon>
              </span>
            </span>
            <span
              class="flex-1 w-0.5"
              :class="idx === store.workerPreview?.worker?.old_careers?.length - 1 ? 'bg-transparent' : 'bg-surface-line'"
            ></span>
          </div>
          <div class="flex-1 min-w-0 bg-surface-ground-soft rounded-3xl px-5 py-4 mb-2">
            <div class="text-base font-bold text-textColor0">
              {{ Utils.timeOnlyYear(item?.from_date) }} — {{ Utils.timeOnlyYear(item?.to_date) }}
            </div>
            <div class="text-textColor2 mt-1">{{ item.post_name }}</div>
          </div>
        </div>
      </div>
      <h4 v-else class="text-center text-secondary">
        {{ $t('content.no-data') }}
      </h4>
    </SectionHeader>
  </div>
</template>
