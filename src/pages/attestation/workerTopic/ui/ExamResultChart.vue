<script setup>
  import i18n from '@/i18n/index.js'
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { BarChart } from 'echarts/charts'
  import { TooltipComponent, TitleComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { useAppStore, useExamDashboardService } from '@/store/modules/index.js'

  use([TooltipComponent, TitleComponent, BarChart, GridComponent, CanvasRenderer])

  const store = useExamDashboardService()
  const appStore = useAppStore()
  const t = i18n.global.t

  // Grading-mezoni bo'yicha yumshoq ranglar: qizil → to'q sariq → sariq → yashil
  const colors = ['#EE7A76', '#EFA968', '#E7C765', '#6FC3A0']

  const option = ref({
    title: {
      text: t('examPage.dashboard.title'),
      left: 'center',
      top: 12,
      textStyle: {
        color: '#1f2937',
        fontSize: 16,
        fontWeight: 700
      }
    },
    grid: {
      left: 8,
      right: 30,
      top: 52,
      bottom: 10,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (p) => `${p[0].name}: <b>${p[0].value}</b>`
    },
    xAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#93a0b2', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(91,107,130,0.12)' } }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: [],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#5b6b82', fontWeight: 600, fontSize: 12 }
    },
    series: [
      {
        type: 'bar',
        barWidth: 16,
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(91,107,130,0.08)',
          borderRadius: 8
        },
        itemStyle: {
          borderRadius: 8
        },
        label: {
          show: true,
          position: 'right',
          color: '#5b6b82',
          fontWeight: 700,
          fontSize: 12
        },
        data: []
      }
    ]
  })

  watch(
    () => store.examStats,
    (v) => {
      const list = v || []
      option.value.yAxis.data = list.map((i) => i.label)
      option.value.series[0].data = list.map((i, idx) => ({
        value: Number(i.count),
        itemStyle: { color: colors[idx % colors.length] }
      }))
    },
    {
      immediate: true
    }
  )

  watch(
    () => appStore.themeSwitch,
    (v) => {
      if (v) {
        option.value.title.textStyle.color = '#e5eaf1'
        option.value.yAxis.axisLabel.color = '#aeb9ca'
        option.value.xAxis.axisLabel.color = '#8090a4'
        option.value.series[0].label.color = '#aeb9ca'
        option.value.xAxis.splitLine.lineStyle.color = 'rgba(255,255,255,0.08)'
        option.value.series[0].backgroundStyle.color = 'rgba(255,255,255,0.06)'
      } else {
        option.value.title.textStyle.color = '#1f2937'
        option.value.yAxis.axisLabel.color = '#5b6b82'
        option.value.xAxis.axisLabel.color = '#93a0b2'
        option.value.series[0].label.color = '#5b6b82'
        option.value.xAxis.splitLine.lineStyle.color = 'rgba(91,107,130,0.12)'
        option.value.series[0].backgroundStyle.color = 'rgba(91,107,130,0.08)'
      }
    },
    {
      immediate: true
    }
  )

  onMounted(() => {
    store._worker_statistics()
  })
</script>
<template>
  <div
    class="bg-surface-section h-full w-full rounded-xl border border-surface-line shadow-[0_1px_2px_rgba(16,26,43,0.05)] flex flex-col py-2"
  >
    <div class="grow">
      <v-chart :option="option" autoresize :loading="store.loading" />
    </div>
  </div>
</template>
