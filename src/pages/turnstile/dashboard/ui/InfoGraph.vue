<script setup>
  import CardHeader from './CardHeader.vue'
  import DetailsLine from './DetailsLine.vue'
  import PrivilegeDonut from './PrivilegeDonut.vue'
  import { InfoGraphSkeleton } from './skeleton/index.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import HeadPieChartIcon from '@/assets/icons/dashboard/head-pie-chart.svg'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  // Kelmagan bo'lsa ham sababi bor xodimlar: ta'til, grafikdagi dam olish kuni, sababli.
  const cells = computed(() => [
    {
      previewType: 'att_vacation',
      label: 'turnStileDashboard.attendance.vacation',
      count: store.attendance?.vacation || 0,
      color: '--fig-icon-indigo',
      delta: store.deltas.vacation
    },
    {
      previewType: 'att_day_off',
      label: 'turnStileDashboard.attendance.day_off',
      count: store.attendance?.day_off || 0,
      color: '--fig-icon-amber',
      delta: store.deltas.dayOff
    },
    {
      previewType: 'att_excused',
      label: 'turnStileDashboard.attendance.excused',
      count: store.attendance?.excused || 0,
      color: '--fig-icon-green',
      delta: store.deltas.excused
    }
  ])

  const donutData = computed(() =>
    cells.value.map((v) => ({ value: v.count, name: v.label, color: v.color }))
  )
</script>

<template>
  <div class="bg-surface-section shadow-card rounded-2xl px-1 pb-1 relative overflow-hidden">
    <InfoGraphSkeleton v-if="store.grandLoading" />

    <template v-else>
      <CardHeader
        :icon="HeadPieChartIcon"
        tint="blue"
        :title="$t('turnStileDashboard.cards.privilege_turnstile_workers')"
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
            <div v-if="idx < cells.length - 1" class="h-px w-full bg-fig-br-disable"></div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
