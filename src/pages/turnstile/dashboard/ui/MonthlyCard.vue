<script setup>
  import { Eye20Filled, Board20Filled } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import CardHeader from './CardHeader.vue'
  import DeltaBadge from './DeltaBadge.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const formatted = computed(() => Utils.formatNumberToMoney(store.monthlyTotalWorkerCount) || '0')
</script>

<template>
  <div
    class="stretch-card p-4 bg-surface-section/75 border border-surface-line rounded-2xl relative overflow-hidden flex flex-col"
  >
    <n-spin :show="store.monthlyLoading" class="flex-1 flex flex-col">
      <CardHeader
        :icon="Board20Filled"
        type="warning"
        :title="$t('turnStileDashboard.cards.graphAnalytic')"
        :subtitle="$t('turnStileDashboard.cards.graphAnalyticDescription')"
      />

      <!-- markazdagi xira illyustratsiya: orqada yumshoq dog', ustida qiyshaytirilgan ikonka -->
      <div class="flex-1 flex justify-center items-center py-6 min-h-[160px] relative">
        <span
          aria-hidden="true"
          class="absolute w-[190px] h-[170px] rounded-[60px] bg-danger/6 blur-xl -rotate-[20deg]"
        ></span>
        <svg
          viewBox="0 0 120 120"
          class="relative w-[140px] h-[140px] text-danger/20 -rotate-[20deg]"
          fill="none"
          stroke="currentColor"
          stroke-width="9"
          stroke-linecap="round"
        >
          <rect x="14" y="14" width="92" height="92" rx="26" />
          <path d="M46 18 V102" />
          <path d="M50 46 H102" />
          <path d="M50 74 H102" />
        </svg>
      </div>

      <div
        @click="emits('onPreview', 'notIncludedSchedule')"
        class="bg-danger/5 hover:bg-danger/10 transition-all duration-300 cursor-pointer rounded-xl p-3 relative group"
      >
        <div
          class="z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-danger opacity-0 group-hover:opacity-100 group-hover:scale-100"
        >
          <n-icon size="28">
            <Eye20Filled />
          </n-icon>
        </div>

        <div class="transition-all duration-300 group-hover:opacity-[0.2]">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs text-secondary leading-[1.3]">
              {{ $t('turnStileDashboard.compare.withoutSchedule') }}
            </span>
            <span class="font-grotesk font-bold text-textColor0 text-[24px] leading-[1.1]">
              {{ formatted }}
            </span>
          </div>
          <div class="border-t border-surface-line mt-3 pt-3">
            <DeltaBadge
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
