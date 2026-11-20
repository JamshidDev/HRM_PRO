<script setup>
  import CardHeader from './CardHeader.vue'
  import PrivilegeDonut from './PrivilegeDonut.vue'
  import { ChevronRight20Regular } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import { UICountUp } from '@/components/index.js'
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
      info: 'turnStileDashboard.attendance.vacationInfo',
      count: store.attendance?.vacation || 0,
      color: '--fig-icon-brand'
    },
    {
      previewType: 'att_day_off',
      label: 'turnStileDashboard.attendance.day_off',
      info: 'turnStileDashboard.attendance.day_offInfo',
      count: store.attendance?.day_off || 0,
      color: '--fig-icon-amber'
    },
    {
      previewType: 'att_excused',
      label: 'turnStileDashboard.attendance.excused',
      info: 'turnStileDashboard.attendance.excusedInfo',
      count: store.attendance?.excused || 0,
      color: '--fig-icon-indigo'
    }
  ])

  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'
  const total = computed(() => cells.value.reduce((sum, c) => sum + c.count, 0))
  const share = (v) => (total.value ? Math.round((v / total.value) * 100) : 0)
  const donutData = computed(() =>
    cells.value.map((v) => ({ value: v.count, name: v.label, color: v.color }))
  )
</script>

<template>
  <div
    class="bg-surface-section shadow-card rounded-2xl px-1 pb-1 relative overflow-hidden flex flex-col"
  >
    <InfoGraphSkeleton v-if="store.grandLoading" />

    <template v-else>
      <CardHeader
        :icon="HeadPieChartIcon"
        tint="blue"
        :title="$t('turnStileDashboard.cards.privilege_turnstile_workers')"
      />

      <div class="flex items-center gap-2 px-2 pb-2 flex-1">
        <div class="shrink-0">
          <PrivilegeDonut :data="donutData" width="150px" height="150px" />
        </div>

        <div class="flex-1 min-w-0 flex flex-col gap-2">
          <div
            v-for="(cell, idx) in cells"
            :key="idx"
            :title="$t(cell.info)"
            class="group border border-fig-br-secondary rounded-xl px-2.5 py-2 cursor-pointer transition-colors duration-200 hover:bg-surface-ground-soft"
            @click="emits('onPreview', cell.previewType)"
          >
            <div class="flex items-center gap-1.5">
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0"
                :style="{ backgroundColor: `var(${cell.color})` }"
              ></span>
              <span
                class="flex-1 min-w-0 text-[13px] leading-[18px] text-fig-text-secondary truncate"
              >
                {{ $t(cell.label) }}
              </span>
              <n-icon
                size="14"
                class="shrink-0 text-fig-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <ChevronRight20Regular />
              </n-icon>
            </div>
            <div class="flex items-baseline gap-1.5 pl-4">
              <span
                class="font-grotesk font-semibold text-[18px] leading-[22px] text-fig-text-primary whitespace-nowrap"
              >
                <UICountUp :value="formatCount(cell.count)" />
              </span>
              <span class="text-[12px] leading-[16px] text-fig-text-tertiary">
                {{ share(cell.count) }}%
              </span>
            </div>
            <p class="pl-4 text-[11px] leading-[14px] text-fig-text-tertiary line-clamp-2">
              {{ $t(cell.info) }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
