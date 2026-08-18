<script setup>
  /**
   * Figma v3 · Tab 3 "Kasallik varaqalari" (node 2966:69283).
   *
   * Yuqorida yarim halqa (faol / tugagan ulushi), ostida jami son, eng pastda
   * esa `bg-secondary` blokda ikkita "Details Line".
   */
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { PieChart } from 'echarts/charts'
  import { TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import HeadMedicalFile from '@/assets/icons/hrmDashboard/head-medical-file.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigDetailLine from '../fig/FigDetailLine.vue'
  import { useDashboardStore, useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'

  use([TooltipComponent, PieChart, CanvasRenderer])

  const store = useDashboardStore()
  const appStore = useAppStore()
  const { t } = i18n.global

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const card = computed(() => store.dashboard?.disabilityCard?.sickLeave || null)

  const rows = computed(() => [
    {
      label: t('dashboardPage.disability.active'),
      count: card.value?.active_count ?? 0,
      token: '--fig-icon-green'
    },
    {
      label: t('dashboardPage.disability.finished'),
      count: card.value?.finished_count ?? 0,
      token: '--fig-neutral-300'
    }
  ])

  const option = computed(() => {
    // `isDark` ga bog'lanamiz — mavzu almashganda yoy ranglari yangilanadi.
    appStore.isDark

    return {
      tooltip: {
        // `body` ga ko'chiriladi: aks holda `.main-content` dagi
        // `overflow-x: hidden` tooltipni kontent chegarasida kesadi.
        appendTo: 'body',
        trigger: 'item',
        backgroundColor: tokenColor('--surface-section'),
        borderColor: tokenColor('--surface-line'),
        textStyle: { color: tokenColor('--fig-text-primary'), fontSize: 12 }
      },
      series: [
        {
          type: 'pie',
          // maketdagi yarim halqa: 180° dan 360° gacha
          startAngle: 180,
          endAngle: 360,
          radius: ['62%', '100%'],
          center: ['50%', '92%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderRadius: 6,
            borderColor: tokenColor('--fig-block-bg'),
            borderWidth: 2
          },
          data: rows.value.map((row) => ({
            value: row.count,
            name: row.label,
            itemStyle: { color: tokenColor(row.token) }
          }))
        }
      ]
    }
  })

  const format = (value) => Utils.formatNumberToMoney(value) || String(value ?? 0)
</script>

<template>
  <FigPanel
    v-if="card"
    muted
    tint="red"
    :icon="HeadMedicalFile"
    :title="$t('dashboardPage.disability.sickLeaveTitle')"
    :inner="false"
  >
    <div class="flex min-h-px flex-1 flex-col justify-center gap-2">
      <div class="flex flex-col items-center gap-2.5 p-2">
        <div class="h-[110px] w-full max-w-[240px]">
          <v-chart autoresize :option="option" class="h-full w-full" />
        </div>
        <p
          class="w-full text-[20px] leading-[26px] font-semibold whitespace-nowrap text-fig-text-primary"
        >
          {{ format(card.total_count) }}
        </p>
      </div>

      <div class="mt-auto flex gap-1 rounded-xl bg-fig-bg-secondary px-3 py-1.5">
        <FigDetailLine
          v-for="(row, idx) in rows"
          :key="idx"
          :label="row.label"
          :value="row.count"
          :token="row.token"
        />
      </div>
    </div>
  </FigPanel>
</template>
