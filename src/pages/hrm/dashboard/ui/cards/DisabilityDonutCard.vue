<script setup>
  /**
   * Figma v3 · Tab 2 "Nogironlik bo'yicha" (node 2959:59253 va 2959:59288).
   *
   * Chapda umumiy son, o'tgan yilga nisbatan o'zgarish va guruhlar ro'yxati
   * (2px rangli chiziqli "Details Line"), o'ngda 180px donut.
   * `type` bo'yicha ikki variant: ishchi va qarindosh nogironligi.
   */
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { PieChart } from 'echarts/charts'
  import { TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import HeadDisability from '@/assets/icons/hrmDashboard/head-disability.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigDetailLine from '../fig/FigDetailLine.vue'
  import FigTrend from '../fig/FigTrend.vue'
  import { useDashboardStore, useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount } from '../../format.js'

  use([TooltipComponent, PieChart, CanvasRenderer])

  const props = defineProps({
    type: {
      type: String,
      required: true // 'worker' | 'relative'
    }
  })

  const emit = defineEmits(['detail'])

  const store = useDashboardStore()
  const appStore = useAppStore()
  const { t } = i18n.global

  const TOKENS = ['--fig-icon-green', '--fig-icon-brand', '--fig-icon-amber']

  const CONFIG = {
    worker: {
      titleKey: 'dashboardPage.disability.workerTitle',
      path: 'worker_disabilities'
    },
    relative: {
      titleKey: 'dashboardPage.disability.relativeTitle',
      path: 'worker_relative_disabilities'
    }
  }

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const config = computed(() => CONFIG[props.type] || CONFIG.worker)
  const card = computed(() => store.movement[config.value.path] || {})
  const isMock = computed(() => store.isMock('movement', config.value.path))

  // Backend guruhlarni to'liq qaytarmasligi mumkin — uchtasi ham doim chiziladi.
  const rows = computed(() => {
    const levels = card.value.levels || []
    return [1, 2, 3].map((level) => ({
      label: `${level}-${t('dashboardPage.disability.group')}`,
      count: levels.find((item) => item.level === level)?.count ?? 0
    }))
  })

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
          radius: ['58%', '100%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderRadius: 4,
            borderColor: tokenColor('--fig-block-bg'),
            borderWidth: 2
          },
          data: rows.value.map((row, idx) => ({
            value: row.count,
            name: row.label,
            itemStyle: { color: tokenColor(TOKENS[idx % TOKENS.length]) }
          }))
        }
      ]
    }
  })
</script>

<template>
  <FigPanel
    muted
    tint="blue"
    :icon="HeadDisability"
    :title="$t(config.titleKey)"
    :action-text="$t('content.detail')"
    :mock="isMock"
    :inner="false"
    @action="emit('detail')"
  >
    <div class="flex flex-wrap items-center gap-5 pr-2 pb-2 pl-2">
      <div class="flex min-w-[200px] flex-1 flex-col gap-3 py-1.5">
        <div class="flex flex-col gap-1">
          <p class="text-[20px] leading-[30px] font-semibold whitespace-nowrap text-fig-text-primary">
            {{ toCount(card.total?.value) }}
          </p>
          <FigTrend :metric="card.total" unit="count" />
        </div>
        <div class="flex flex-col gap-1">
          <FigDetailLine
            v-for="(row, idx) in rows"
            :key="idx"
            :label="row.label"
            :value="row.count"
            :token="TOKENS[idx % TOKENS.length]"
          />
        </div>
      </div>

      <div class="h-[180px] w-[180px] shrink-0">
        <v-chart autoresize :option="option" class="h-full w-full" />
      </div>
    </div>
  </FigPanel>
</template>
