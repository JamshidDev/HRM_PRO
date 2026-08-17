<script setup>
  import CardHeader from './CardHeader.vue'
  import DetailsLine from './DetailsLine.vue'
  import PrivilegeDonut from './PrivilegeDonut.vue'
  import { InfoGraphSkeleton } from './skeleton/index.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import HeadPieChartIcon from '@/assets/icons/dashboard/head-pie-chart.svg'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const cells = computed(() => [
    {
      previewType: 'privilege_turnstile_workers',
      label: 'turnStileDashboard.cards.privilege',
      count: store.grandWorkerData?.privilege_turnstile_workers_count || 0,
      color: '--fig-icon-green',
      delta: store.deltas.privilege
    },
    {
      previewType: 'not_passed_turnstile_workers',
      label: 'turnStileDashboard.cards.dontPassFace',
      count: store.grandWorkerData?.not_passed_turnstile_workers_count || 0,
      color: '--fig-icon-brand',
      delta: store.deltas.notPassed,
      invert: true
    },
    {
      previewType: 'vacations',
      label: 'turnStileDashboard.cards.onVacation',
      count: store.grandWorkerData?.vacation_workers?.total || 0,
      color: '--fig-icon-indigo',
      delta: store.deltas.vacation
    },
    {
      previewType: 'casual_workers',
      label: 'turnStileDashboard.cards.onHoliday',
      count: store.grandWorkerData?.casual_workers || 0,
      color: '--fig-icon-amber',
      delta: store.deltas.casual
    }
  ])

  const donutData = computed(() =>
    cells.value.map((v) => ({ value: v.count, name: v.label, color: v.color }))
  )
</script>

<template>
  <div class="bg-surface-section rounded-2xl px-1 pb-1 relative overflow-hidden">
    <InfoGraphSkeleton v-if="store.grandLoading" />

    <template v-else>
      <CardHeader
        :icon="HeadPieChartIcon"
        tint="blue"
        :title="$t('turnStileDashboard.cards.privilege_turnstile_workers')"
        :subtitle="$t('turnStileDashboard.cards.privilegeSubtitle')"
      />

      <div class="flex flex-wrap items-center gap-4">
        <div class="p-2 shrink-0 mx-auto">
          <PrivilegeDonut :data="donutData" width="228px" height="228px" />
        </div>

        <div class="flex-1 min-w-[220px] bg-surface-ground-soft rounded-xl px-3 py-1.5">
          <template v-for="(cell, idx) in cells" :key="idx">
            <DetailsLine
              clickable
              :label="$t(cell.label)"
              :count="cell.count"
              :bar-color="cell.color"
              :delta="cell.delta"
              :invert="cell.invert"
              :delta-loading="store.compareLoading"
              @click="emits('onPreview', cell.previewType)"
            />
            <div v-if="idx < 2" class="h-px w-full bg-fig-br-disable"></div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
