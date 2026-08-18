<script setup>
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { PieChart } from 'echarts/charts'
  import { TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import HeadPie from '@/assets/icons/accDashboard/head-pie.svg'
  import PanelHeader from './PanelHeader.vue'
  import { useAccDashboardStore, useAppStore } from '@/store/modules/index.js'
  import { toMln } from '../format.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'

  use([TooltipComponent, PieChart, CanvasRenderer])

  const store = useAccDashboardStore()
  const appStore = useAppStore()
  const { t } = i18n.global

  // Maketdagi segment tartibi: fondga kiruvchi — ko'k, kiritilmaydigan — yashil,
  // fondga kirmaydigan — sariq.
  const TOKENS = ['--fig-icon-brand', '--fig-icon-green', '--fig-icon-amber']
  const TEXTS = ['text-fig-text-brand', 'text-fig-text-green', 'text-fig-chip-amber-text']

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const items = computed(() =>
    store.fundParts.items.map((item, index) => ({
      ...item,
      token: TOKENS[index % TOKENS.length],
      textClass: TEXTS[index % TEXTS.length]
    }))
  )

  const option = computed(() => {
    // `isDark` ga bog'lanamiz — mavzu almashganda segment ranglari yangilanadi.
    appStore.isDark

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: tokenColor('--surface-section'),
        borderColor: tokenColor('--surface-line'),
        textStyle: { color: tokenColor('--fig-text-primary'), fontSize: 12 },
        formatter: (params) =>
          `${params.name}<br/>${Utils.formatNumberToMoney(Math.round(params.value / 1_000_000)) || '0'} ${t('content.mln')} (${params.percent}%)`
      },
      series: [
        {
          type: 'pie',
          radius: ['62%', '100%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderRadius: 4,
            borderColor: tokenColor('--fig-block-bg'),
            borderWidth: 2
          },
          data: items.value.map((item) => ({
            value: item.value,
            name: t(`accDashboard.chart.${item.key}`),
            itemStyle: { color: tokenColor(item.token) }
          }))
        }
      ]
    }
  })
</script>

<template>
  <div class="flex flex-col rounded-2xl bg-fig-block px-1 pb-1">
    <PanelHeader
      tint="amber"
      :icon="HeadPie"
      :title="$t('accDashboard.panel.fund')"
      :subtitle="$t('accDashboard.panel.fund_subtitle')"
    />

    <div class="flex flex-wrap items-center gap-5 p-2">
      <!-- 190px donut, markazida jami summa -->
      <div class="relative h-[190px] w-[190px] shrink-0">
        <v-chart autoresize :option="option" class="h-full w-full" />
        <div
          class="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
        >
          <p class="text-[25px] leading-8 font-semibold text-fig-text-primary">
            {{ toMln(store.fundParts.total) }}
          </p>
          <p class="text-[14px] leading-[21px] text-fig-text-tertiary">
            {{ $t('content.mln') }} {{ $t('accDashboard.panel.total_suffix') }}
          </p>
        </div>
      </div>

      <div class="grid min-w-[280px] flex-1 gap-5 xl:grid-cols-3">
        <div v-for="item in items" :key="item.key" class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 flex-1 flex-col justify-center gap-2">
            <div class="flex w-full items-center gap-2">
              <span
                class="h-2.5 w-2.5 shrink-0 rounded-full"
                :style="{ backgroundColor: `var(${item.token})` }"
              ></span>
              <p class="min-w-0 flex-1 text-[12px] leading-4 text-fig-text-secondary">
                {{ $t(`accDashboard.chart.${item.key}`) }}
              </p>
            </div>
            <p
              class="text-[14px] leading-[18px] font-semibold whitespace-nowrap text-fig-text-primary"
            >
              {{ toMln(item.value) }} {{ $t('content.mln') }}
            </p>
          </div>
          <p class="shrink-0 text-[14px] leading-[18px] font-medium" :class="item.textClass">
            {{ Math.round(item.percent) }}%
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
