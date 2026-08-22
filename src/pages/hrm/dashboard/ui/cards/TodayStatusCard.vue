<script setup>
  /**
   * Figma v3 · Tab 1 "Bugungi holat" (node 2959:58379).
   *
   * Chapda donut — markazida ishda bo'lganlar ulushi, o'ngda esa har bir holat
   * uchun qator: rangli nuqta, nom, son, ulush va o'zgarish.
   */
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { PieChart } from 'echarts/charts'
  import { TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigTrend from '../fig/FigTrend.vue'
  import { useDashboardStore, useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount, toPercent, toRoundPercent } from '../../format.js'

  use([TooltipComponent, PieChart, CanvasRenderer])

  defineEmits(['detail'])

  const store = useDashboardStore()
  const appStore = useAppStore()
  const { t } = i18n.global

  // Maketdagi tartib: ishda — ko'k, ta'tilda — yashil, kasallik — amber, sababsiz — qizil
  const TOKENS = {
    working: '--fig-icon-brand',
    vacation: '--fig-icon-green',
    sick_leave: '--fig-icon-amber',
    absent: '--fig-icon-red'
  }

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const card = computed(() => store.overview.today_status || {})
  const isMock = computed(() => store.isMock('overview', 'today_status'))

  const rows = computed(() =>
    (card.value.items || []).map((item) => ({
      ...item,
      label: item.label ?? t(`dashboardPage.today.statuses.${item.key}`),
      token: TOKENS[item.key] || '--fig-icon-brand'
    }))
  )

  /** Markazdagi katta foiz — "ishda" holatining ulushi. */
  const working = computed(() => rows.value.find((row) => row.key === 'working'))

  const option = computed(() => {
    // `isDark` ga bog'lanamiz — mavzu almashganda segment ranglari yangilanadi.
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
          radius: ['66%', '100%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderRadius: 4,
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
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.today.title')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="px-3 py-2"
    @action="$emit('detail')"
  >
    <div class="flex flex-wrap items-center gap-4">
      <div class="relative h-[150px] w-[150px] shrink-0">
        <v-chart autoresize :option="option" class="h-full w-full" />
        <div
          class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5"
        >
          <p class="text-[20px] leading-6 font-semibold text-fig-text-primary">
            {{ toRoundPercent(working?.percent) }}
          </p>
          <p class="text-[12px] leading-4 text-fig-text-tertiary">
            {{ $t('dashboardPage.today.statuses.working') }}
          </p>
        </div>
      </div>

      <div class="flex min-w-[240px] flex-1 flex-col">
        <div v-for="row in rows" :key="row.key" class="flex items-center gap-2 py-1">
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-[3px]"
            :style="{ backgroundColor: `var(${row.token})` }"
          ></span>
          <p class="min-w-0 flex-1 truncate text-[12px] leading-4 text-fig-text-secondary">
            {{ row.label }}
          </p>
          <p
            class="w-[52px] shrink-0 text-right text-[12px] leading-4 font-semibold text-fig-text-primary"
          >
            {{ toCount(row.count) }}
          </p>
          <p class="w-[44px] shrink-0 text-right text-[12px] leading-4 text-fig-text-tertiary">
            {{ toPercent(row.percent) }}
          </p>
          <div class="w-[104px] shrink-0">
            <FigTrend :metric="row" unit="count" :label-key="null" />
          </div>
        </div>
      </div>
    </div>
  </FigPanel>
</template>
