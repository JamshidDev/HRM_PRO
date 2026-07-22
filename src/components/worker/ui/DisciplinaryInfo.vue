<script setup>
  import { Warning24Filled, NumberSymbol20Regular, QuestionCircle20Regular } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import Utils from '../../../utils/Utils.js'
  import CalendarIcon from '@/assets/icons/calendarIcon.svg'
  import DepartmentIcon from '@/assets/icons/departmentIcon.svg'

  const store = useComponentStore()
</script>

<template>
  <div>
    <SectionHeader :title="$t('workerView.tabs.punishment')" :icon="Warning24Filled">
      <div v-if="store.workerPreview?.worker?.disciplinary_actions?.length" class="flex flex-col gap-4">
        <div
          v-for="(item, idx) in store.workerPreview?.worker?.disciplinary_actions"
          :key="idx"
          class="bg-surface-section rounded-3xl p-4"
        >
          <n-tooltip trigger="hover" :style="{ maxWidth: '300px' }">
            <template #trigger>
              <div class="font-semibold text-lg text-primary truncate-text cursor-pointer mb-3">
                {{ item.fine }}
              </div>
            </template>
            {{ item.fine }}
          </n-tooltip>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14"><CalendarIcon /></n-icon>
                {{ $t('content.date') }}
              </div>
              <div class="font-semibold text-textColor0">{{ Utils.timeOnlyDate(item.date) }}</div>
            </div>
            <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14"><DepartmentIcon /></n-icon>
                {{ $t('content.organization') }}
              </div>
              <n-tooltip trigger="hover" :style="{ maxWidth: '300px' }">
                <template #trigger>
                  <div class="font-semibold text-textColor0 truncate-text cursor-pointer">
                    {{ item.organization?.name }}
                  </div>
                </template>
                {{ item.organization?.name }}
              </n-tooltip>
            </div>
            <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14"><NumberSymbol20Regular /></n-icon>
                {{ $t('content.number') }}
              </div>
              <div class="font-semibold text-textColor0">{{ item.number }}</div>
            </div>
            <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14"><QuestionCircle20Regular /></n-icon>
                {{ $t('incentive.form.reason') }}
              </div>
              <div class="font-semibold text-textColor0">{{ item.reason }}</div>
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

<style scoped>
  .truncate-text {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
