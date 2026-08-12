<script setup>
  import { Clock20Filled } from '@vicons/fluent'
  import WorkTimeChart from '@/pages/turnstile/dashboard/ui/WorkTimeChart.vue'
  import CardHeader from './CardHeader.vue'
  import MetricCell from './MetricCell.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'

  const store = useTurnstileDashboardStore()

  const lateComeCount = computed(() => store.workTime?.late_and_early?.late?.[0]?.count || 0)
  const earlyGoCount = computed(() => store.workTime?.late_and_early?.early?.[0]?.count || 0)

  const cells = computed(() => [
    {
      label: 'turnStileDashboard.cards.earlyGo',
      count: earlyGoCount.value,
      color: 'success',
      delta: store.deltas.early,
      invert: true,
      previewType: 'early_leave'
    },
    {
      label: 'turnStileDashboard.cards.lateCome',
      count: lateComeCount.value,
      color: 'danger',
      delta: store.deltas.late,
      invert: true,
      previewType: 'late_come'
    }
  ])

  const emits = defineEmits(['onPreview'])
</script>

<template>
  <div
    class="p-4 bg-surface-section/75 border border-surface-line rounded-2xl relative overflow-hidden"
  >
    <n-spin :show="store.workTimeLoading">
      <CardHeader
        :icon="Clock20Filled"
        type="primary"
        :title="$t('turnStileDashboard.cards.workTimeTitle')"
        :subtitle="$t('turnStileDashboard.cards.workTimeSubtitle')"
      />

      <div class="grid grid-cols-2 gap-2 mt-4">
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
          clickable
          @click="emits('onPreview', cell.previewType)"
        />
      </div>

      <div class="mt-4 border border-surface-line rounded-xl p-2">
        <WorkTimeChart />
      </div>
    </n-spin>
  </div>
</template>
