<script setup>
  import { Settings24Regular, Mail24Regular, CheckmarkCircle20Filled } from '@vicons/fluent'
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
          class="grid grid-cols-12 items-center gap-2 bg-primary/5 border border-primary/10 rounded-lg px-4 py-3"
        >
          <div class="col-span-12 md:col-span-3 font-semibold text-textColor0">
            {{ Utils.timeOnlyYear(item?.from) }} —
            {{ Utils.timeOnlyYear(item?.to) || $t('content.untilNow') }}
          </div>
          <div class="col-span-12 md:col-span-7 text-textColor2">
            {{ item.full_position }}
          </div>
          <div class="col-span-12 md:col-span-2 flex md:justify-end">
            <UIBadge
              v-if="!item?.to"
              :label="$t('workerView.career.currentLabel')"
              :type="Utils.colorTypes.success"
              :show-icon="false"
              class="!w-auto"
            />
          </div>
        </div>
      </div>
      <h4 v-else class="text-center text-secondary">
        {{ $t('content.no-data') }}
      </h4>
    </SectionHeader>

    <SectionHeader :title="$t('oldCareerPage.title')" :icon="Mail24Regular">
      <div v-if="store.workerPreview?.worker?.old_careers?.length" class="flex flex-col gap-2">
        <div
          v-for="(item, idx) in store.workerPreview?.worker?.old_careers"
          :key="idx"
          class="flex items-center gap-3 bg-surface-ground rounded-lg px-4 py-3"
        >
          <n-icon size="24" class="text-primary shrink-0">
            <CheckmarkCircle20Filled />
          </n-icon>
          <div>
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
