<script setup>
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import CardHeader from './CardHeader.vue'
  import MetricCell from './MetricCell.vue'
  import DailyEventChart from './DailyEventChart.vue'
  import HeadUsersIcon from '@/assets/icons/dashboard/head-users.svg'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const cells = computed(() => [
    {
      label: 'turnStileDashboard.cards.allWorkerOfCompany',
      count: store.totalWorkerCount || 0,
      dotColor: '--fig-icon-indigo',
      delta: store.deltas.totalWorkers,
      previewType: null
    },
    {
      label: 'turnStileDashboard.cards.planned',
      count: store.mainChart?.scheduled_workers_today || 0,
      dotColor: '--fig-icon-brand',
      delta: store.deltas.planned,
      previewType: null
    },
    {
      label: 'turnStileDashboard.cards.todayCome',
      count: store.mainChart?.attended_workers_today || 0,
      dotColor: '--fig-icon-green',
      delta: store.deltas.come,
      previewType: 'come'
    },
    {
      label: 'turnStileDashboard.cards.todayDontCome',
      count: store.mainChart?.absent_workers_today || 0,
      dotColor: '--fig-icon-red',
      delta: store.deltas.notCome,
      invert: true,
      previewType: 'not_come'
    }
  ])
</script>

<template>
  <div class="bg-surface-section rounded-2xl px-1 pb-1 relative overflow-hidden">
    <n-spin :show="store.mainChartLoading">
      <CardHeader
        :icon="HeadUsersIcon"
        tint="indigo"
        :title="$t('turnStileDashboard.cards.workerAnalytic')"
        :subtitle="$t('turnStileDashboard.cards.workerAnalyticDescription')"
      />

      <div class="flex flex-wrap items-center gap-1 px-2 py-2">
        <MetricCell
          v-for="(cell, idx) in cells"
          :key="idx"
          :label="$t(cell.label)"
          :count="cell.count"
          :dot-color="cell.dotColor"
          :delta="cell.delta"
          :invert="cell.invert"
          :delta-loading="store.compareLoading"
          :clickable="!!cell.previewType"
          @click="cell.previewType && emits('onPreview', cell.previewType)"
        />
      </div>

      <div class="bg-surface-ground-soft rounded-xl px-3 py-1.5 h-[178px]">
        <DailyEventChart />
      </div>
    </n-spin>
  </div>
</template>
