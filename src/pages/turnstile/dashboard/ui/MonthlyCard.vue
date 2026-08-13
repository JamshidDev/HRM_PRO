<script setup>
  import { Eye20Filled } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import CardHeader from './CardHeader.vue'
  import DeltaBadge from './DeltaBadge.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import HeadTableRowsIcon from '@/assets/icons/dashboard/head-table-rows.svg'
  import GraphWatermark from '@/assets/icons/dashboard/graph-watermark.svg'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const formatted = computed(() => Utils.formatNumberToMoney(store.monthlyTotalWorkerCount) || '0')
</script>

<template>
  <div
    class="stretch-card bg-surface-section rounded-2xl px-1 pb-1 relative overflow-hidden flex flex-col"
  >
    <n-spin :show="store.monthlyLoading" class="flex-1 flex flex-col">
      <CardHeader
        :icon="HeadTableRowsIcon"
        tint="lime"
        :title="$t('turnStileDashboard.cards.graphAnalytic')"
        :subtitle="$t('turnStileDashboard.cards.graphAnalyticDescription')"
      />

      <!-- markazdagi qiyshaytirilgan dekor + pastdan oq gradient niqob -->
      <div class="flex-1 min-h-[160px] relative overflow-hidden p-2">
        <div
          aria-hidden="true"
          class="absolute left-[30px] top-[11px] rotate-[17.7deg] rounded-[48.286px] bg-fig-red-100 opacity-60 p-[24.143px] flex items-center"
        >
          <span class="w-[120.714px] h-[120.714px] flex items-center justify-center">
            <GraphWatermark />
          </span>
        </div>
        <div
          aria-hidden="true"
          class="absolute left-0 bottom-0 w-full h-[125px] bg-gradient-to-b from-transparent to-surface-section"
        ></div>
      </div>

      <div
        @click="emits('onPreview', 'notIncludedSchedule')"
        class="bg-fig-red-50 rounded-xl px-3 py-1.5 min-h-[78px] flex flex-col justify-center gap-2 cursor-pointer relative group"
      >
        <div
          class="z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-fig-red opacity-0 group-hover:opacity-100 group-hover:scale-100"
        >
          <n-icon size="28">
            <Eye20Filled />
          </n-icon>
        </div>

        <div class="transition-all duration-300 group-hover:opacity-[0.2] pl-1">
          <div class="flex items-center gap-1 flex-wrap">
            <span class="text-[12px] leading-[16px] text-fig-text-secondary">
              {{ $t('turnStileDashboard.compare.withoutSchedule') }}
            </span>
            <span
              class="font-grotesk font-semibold text-[20px] leading-[30px] text-fig-text-primary"
            >
              {{ formatted }}
            </span>
          </div>
          <div class="flex items-center justify-between gap-2 mt-1">
            <span class="text-[12px] leading-[16px] text-fig-text-muted">
              {{ $t('turnStileDashboard.compare.vsYesterday') }}
            </span>
            <DeltaBadge
              hide-label
              :delta="store.deltas.withoutSchedule"
              invert
              :loading="store.compareLoading"
            />
          </div>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
  /* n-spin ichki `.n-spin-content` ni ham cho'zamiz — aks holda karta qo'shni
     baland karta bo'yiga tenglashganda kontent tepada qolib, pastda bo'sh joy qoladi. */
  .stretch-card :deep(.n-spin-container),
  .stretch-card :deep(.n-spin-content) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
</style>
