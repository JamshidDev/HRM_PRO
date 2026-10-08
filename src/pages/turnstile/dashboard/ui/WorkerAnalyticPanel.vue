<script setup>
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import CardHeader from './CardHeader.vue'
  import MetricCell from './MetricCell.vue'
  import DailyEventChart from './DailyEventChart.vue'
  import { WorkerAnalyticPanelSkeleton } from './skeleton/index.js'
  import HeadUsersIcon from '@/assets/icons/dashboard/head-users.svg'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const cells = computed(() => [
    {
      label: 'turnStileDashboard.cards.allWorkerOfCompany',
      count: store.attendance?.total || 0,
      dotColor: '--fig-icon-indigo',
      previewType: null
    },
    {
      label: 'turnStileDashboard.cards.planned',
      count: store.attendance?.scheduled || 0,
      dotColor: '--fig-icon-brand',
      previewType: null
    },
    {
      label: 'turnStileDashboard.cards.todayCome',
      count: store.attendance?.came || 0,
      dotColor: '--fig-icon-green',
      previewType: 'att_came'
    },
    {
      label: 'turnStileDashboard.cards.todayDontCome',
      count: store.attendance?.absent || 0,
      dotColor: '--fig-icon-red',
      previewType: 'att_absent'
    }
  ])
</script>

<template>
  <div class="bg-surface-section shadow-card rounded-2xl px-1 pb-1 relative overflow-hidden">
    <WorkerAnalyticPanelSkeleton v-if="store.mainChartLoading" />

    <template v-else>
      <CardHeader
        :icon="HeadUsersIcon"
        tint="indigo"
        :title="$t('turnStileDashboard.cards.workerAnalytic')"
      />

      <div class="flex flex-wrap items-center gap-1 px-2 py-2">
        <MetricCell
          v-for="(cell, idx) in cells"
          :key="idx"
          :label="$t(cell.label)"
          :count="cell.count"
          :dot-color="cell.dotColor"
          :clickable="!!cell.previewType"
          @click="cell.previewType && emits('onPreview', cell.previewType)"
        />
      </div>

      <div class="bg-surface-ground-soft rounded-xl px-3 py-1.5 h-[178px]">
        <DailyEventChart />
      </div>
    </template>
  </div>
</template>
