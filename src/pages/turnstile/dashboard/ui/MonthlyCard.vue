<script setup>
  import { CalendarCancel24Regular, ChevronRight20Regular } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import { UICountUp } from '@/components/index.js'
  import CardHeader from './CardHeader.vue'
  import { MonthlyCardSkeleton } from './skeleton/index.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import HeadTableRowsIcon from '@/assets/icons/dashboard/head-table-rows.svg'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const formatted = computed(() => Utils.formatNumberToMoney(store.monthlyTotalWorkerCount) || '0')
  // Faol xodimlar ichidagi ulushi (%).
  const percent = computed(() => {
    const total = store.attendance?.total || 0
    return total ? Math.round(((store.monthlyTotalWorkerCount || 0) / total) * 100) : 0
  })
  const openList = () => emits('onPreview', 'notIncludedSchedule')
</script>

<template>
  <div
    class="bg-surface-section shadow-card rounded-2xl px-1 pb-1 relative overflow-hidden flex flex-col"
  >
    <MonthlyCardSkeleton v-if="store.monthlyLoading" />

    <template v-else>
      <CardHeader
        :icon="HeadTableRowsIcon"
        tint="lime"
        :title="$t('turnStileDashboard.cards.graphAnalytic')"
      />

      <!-- jami son + ulush -->
      <div class="flex-1 flex flex-col justify-center gap-3 px-3 py-3">
        <div class="flex items-center gap-3">
          <span
            class="w-11 h-11 shrink-0 rounded-xl bg-fig-red-100 text-fig-text-red flex items-center justify-center"
          >
            <n-icon size="24"><CalendarCancel24Regular /></n-icon>
          </span>
          <div class="min-w-0">
            <p class="text-[12px] leading-[16px] text-fig-text-secondary truncate">
              {{ $t('turnStileDashboard.compare.withoutSchedule') }}
            </p>
            <p
              class="font-grotesk font-semibold text-[28px] leading-[34px] text-fig-text-primary whitespace-nowrap"
            >
              <UICountUp :value="formatted" />
            </p>
          </div>
          <span
            class="ml-auto shrink-0 rounded-full bg-fig-chip-amber px-2 py-0.5 text-[12px] leading-[16px] font-semibold text-fig-chip-amber-text whitespace-nowrap"
          >
            <UICountUp :value="percent" />%
          </span>
        </div>
        <p class="text-[12px] leading-[16px] text-fig-text-tertiary">
          {{ $t('turnStileDashboard.cards.withoutScheduleInfo') }}
        </p>
      </div>

      <div class="bg-surface-ground-soft rounded-xl p-1.5 flex flex-col">
        <button
          type="button"
          class="group w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-left cursor-pointer transition-colors duration-200 hover:bg-surface-section"
          @click="openList"
        >
          <span class="w-2.5 h-2.5 rounded-full shrink-0 bg-fig-red"></span>
          <span class="flex-1 min-w-0 text-[14px] leading-[20px] text-fig-text-secondary truncate">
            {{ $t('turnStileDashboard.privilegeCard.all') }}
          </span>
          <n-icon
            size="16"
            class="shrink-0 text-fig-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <ChevronRight20Regular />
          </n-icon>
        </button>
      </div>
    </template>
  </div>
</template>
