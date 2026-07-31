<script setup>
  import { useIntegrationLogStore } from '@/store/modules/index.js'
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { BarChart } from 'echarts/charts'
  import { TooltipComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import * as echarts from 'echarts'
  import i18n from '@/i18n/index.js'

  use([BarChart, TooltipComponent, GridComponent, CanvasRenderer])

  const store = useIntegrationLogStore()
  const { t } = i18n.global

  const timelineOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: { show: false },
    grid: { left: '1%', top: '4%', right: '1%', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: store.timeline.map((v) => v.period.slice(5)),
      axisLabel: { fontSize: 11, color: '#888' },
      axisLine: { lineStyle: { color: 'rgba(158,158,158,0.2)' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(158,158,158,0.1)' } }
    },
    series: [
      {
        name: t('integrationLog.dashboard.total'),
        type: 'bar',
        barMaxWidth: 28,
        data: store.timeline.map((v) => v.total_requests),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1A84FF' },
            { offset: 1, color: '#56CCF2' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: t('integrationLog.dashboard.errors'),
        type: 'bar',
        barMaxWidth: 28,
        data: store.timeline.map((v) => v.error_requests),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#E53935' },
            { offset: 1, color: '#FF8A80' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }))
</script>

<template>
  <div class="xl:col-span-8 col-span-12 bg-surface-section border border-surface-line rounded-xl flex flex-col h-full">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-surface-line flex items-center justify-between">
      <h3 class="font-semibold text-sm text-textColor1">{{ $t('integrationLog.dashboard.timeline') }}</h3>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-sm bg-primary/60 flex-shrink-0" />
          <span class="text-[11px] font-medium text-textColor3">{{ $t('integrationLog.dashboard.total') }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-sm bg-danger/60 flex-shrink-0" />
          <span class="text-[11px] font-medium text-textColor3">{{ $t('integrationLog.dashboard.errors') }}</span>
        </div>
      </div>
    </div>
    <!-- Chart -->
    <div class="flex-1 p-3 min-h-[180px]">
      <v-chart autoresize class="w-full h-full" :option="timelineOption" />
    </div>
  </div>
</template>
