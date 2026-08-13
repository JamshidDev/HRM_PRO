<script setup>
  import WorkTimeChart from '@/pages/turnstile/dashboard/ui/WorkTimeChart.vue'
  import CardHeader from './CardHeader.vue'
  import MetricCell from './MetricCell.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import { Utils } from '@/utils/index.js'
  import HeadChartUserIcon from '@/assets/icons/dashboard/head-chart-user.svg'

  const store = useTurnstileDashboardStore()

  // KPI — eng oxirgi kun. Massiv indeksiga tayanmaymiz: backend tartibi
  // (yangidan eskiga yoki aksincha) o'zgarsa raqamlar jimgina buzilib ketardi.
  const lateComeCount = computed(() => Utils.latestByDate(store.workTime?.late_and_early?.late))
  const earlyGoCount = computed(() => Utils.latestByDate(store.workTime?.late_and_early?.early))

  const cells = computed(() => [
    {
      label: 'turnStileDashboard.cards.earlyGo',
      count: earlyGoCount.value,
      dotColor: '--fig-icon-green',
      delta: store.deltas.early,
      invert: true,
      previewType: 'early_leave'
    },
    {
      label: 'turnStileDashboard.cards.lateCome',
      count: lateComeCount.value,
      dotColor: '--fig-icon-red',
      delta: store.deltas.late,
      invert: true,
      previewType: 'late_come'
    }
  ])

  const emits = defineEmits(['onPreview'])
</script>

<template>
  <div class="bg-surface-section rounded-2xl px-1 pb-1 relative overflow-hidden flex flex-col">
    <n-spin :show="store.workTimeLoading" class="stretch-spin">
      <CardHeader
        :icon="HeadChartUserIcon"
        tint="indigo"
        :title="$t('turnStileDashboard.cards.workTimeTitle')"
        :subtitle="$t('turnStileDashboard.cards.workTimeSubtitle')"
      />

      <div class="flex flex-wrap items-center gap-1 px-2 pb-2">
        <MetricCell
          v-for="(cell, idx) in cells"
          :key="idx"
          :label="$t(cell.label)"
          :count="cell.count"
          :dot-color="cell.dotColor"
          :delta="cell.delta"
          :invert="cell.invert"
          :delta-loading="store.compareLoading"
          clickable
          @click="emits('onPreview', cell.previewType)"
        />
      </div>

      <div class="bg-surface-ground-soft rounded-xl px-3 py-1.5 mt-auto h-[178px]">
        <WorkTimeChart />
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
  /* n-spin ichki `.n-spin-content` ni ham cho'zamiz — grafik paneli kartaning
     pastiga yopishishi uchun. */
  .stretch-spin,
  .stretch-spin :deep(.n-spin-container),
  .stretch-spin :deep(.n-spin-content) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
</style>
