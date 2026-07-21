<script setup>
  import { Settings24Regular, CheckmarkCircle20Filled } from '@vicons/fluent'
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
        <div
          v-for="(item, idx) in store.workerPreview?.worker?.new_careers"
          :key="idx"
          class="bg-surface-ground rounded-3xl px-4 py-3"
        >
          <div class="flex items-center gap-2 flex-wrap">
            <div class="font-semibold text-textColor0">
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
      <h4 v-else class="text-center text-secondary">
        {{ $t('content.no-data') }}
      </h4>
    </SectionHeader>

    <SectionHeader :title="$t('oldCareerPage.title')" :icon="PositionIcon">
      <div v-if="store.workerPreview?.worker?.old_careers?.length" class="flex flex-col gap-2">
        <div v-for="(item, idx) in store.workerPreview?.worker?.old_careers" :key="idx" class="flex gap-3">
          <div class="relative w-7 shrink-0">
            <n-icon size="28" class="text-primary">
              <CheckmarkCircle20Filled />
            </n-icon>
            <span
              v-if="idx !== store.workerPreview?.worker?.old_careers?.length - 1"
              class="absolute left-1/2 top-8 bottom-[8px] w-px -translate-x-1/2 bg-surface-line"
            ></span>
          </div>
          <div class="flex-1 min-w-0 bg-surface-ground rounded-3xl px-4 py-3">
            <div class="font-semibold text-textColor0">
              {{ Utils.timeOnlyYear(item?.from_date) }} — {{ Utils.timeOnlyYear(item?.to_date) }}
            </div>
            <div class="text-textColor2">{{ item.post_name }}</div>
          </div>
        </div>
      </div>
      <h4 v-else class="text-center text-secondary">
        {{ $t('content.no-data') }}
      </h4>
    </SectionHeader>
  </div>
</template>
