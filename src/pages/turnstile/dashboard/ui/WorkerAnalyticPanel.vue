<script setup>
  import { PeopleTeam20Filled } from '@vicons/fluent'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import CardHeader from './CardHeader.vue'
  import MetricCell from './MetricCell.vue'
  import DailyEventChart from './DailyEventChart.vue'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const cells = computed(() => [
    {
      label: 'turnStileDashboard.cards.allWorkerOfCompany',
      count: store.totalWorkerCount || 0,
      color: 'dark',
      delta: store.deltas.totalWorkers,
      previewType: null
    },
    {
      label: 'turnStileDashboard.cards.planned',
      count: store.mainChart?.scheduled_workers_today || 0,
      color: 'primary',
      delta: store.deltas.planned,
      previewType: null
    },
    {
      label: 'turnStileDashboard.cards.todayCome',
      count: store.mainChart?.attended_workers_today || 0,
      color: 'success',
      delta: store.deltas.come,
      previewType: 'come'
    },
    {
      label: 'turnStileDashboard.cards.todayDontCome',
      count: store.mainChart?.absent_workers_today || 0,
      color: 'danger',
      delta: store.deltas.notCome,
      invert: true,
      previewType: 'not_come'
    }
  ])
</script>

<template>
  <div
    class="p-4 bg-surface-section/75 border border-surface-line rounded-2xl relative overflow-hidden"
  >
    <n-spin :show="store.mainChartLoading">
      <CardHeader
        :icon="PeopleTeam20Filled"
        type="primary"
        :title="$t('turnStileDashboard.cards.workerAnalytic')"
        :subtitle="$t('turnStileDashboard.cards.workerAnalyticDescription')"
      />

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
        <MetricCell
          v-for="(cell, idx) in cells"
          :key="idx"
          size="lg"
          :label="$t(cell.label)"
          :count="cell.count"
          :color="cell.color"
          :delta="cell.delta"
          :invert="cell.invert"
          :delta-loading="store.compareLoading"
          :clickable="!!cell.previewType"
          @click="cell.previewType && emits('onPreview', cell.previewType)"
        />
      </div>

      <div class="mt-4 border border-surface-line rounded-xl p-2">
        <DailyEventChart />
      </div>
    </n-spin>
  </div>
</template>
