<script setup>
  /**
   * Figma v3 · Tab 2 "Ishdan bo'shatish — asoslari" (node 2959:59069).
   *
   * Treemap: katakcha maydoni bo'shatish sababining ulushiga proporsional,
   * ichida sabab nomi va `146 · 48 %` yozuvi. Maketdagi kabi monoxrom ko'k
   * shkala — eng katta ulush eng to'q rangda.
   */
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { TreemapChart } from 'echarts/charts'
  import { TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import { useDashboardStore, useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount, toRoundPercent } from '../../format.js'

  use([TooltipComponent, TreemapChart, CanvasRenderer])

  defineEmits(['detail'])

  const store = useDashboardStore()
  const appStore = useAppStore()
  const { t } = i18n.global

  // Maketdagi ko'k shkala: to'qdan yorug'ga
  const SHADES = ['#1570ef', '#2e90fa', '#53b1fd', '#84caff', '#b2ddff', '#d1e9ff']

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const card = computed(() => store.movement.dismissal_reasons || {})
  const isMock = computed(() => store.isMock('movement', 'dismissal_reasons'))

  const items = computed(() =>
    (card.value.items || []).map((item, idx) => ({
      ...item,
      label: item.label ?? t(`dashboardPage.dismissal.reasons.${item.key}`),
      color: SHADES[idx % SHADES.length]
    }))
  )

  const option = computed(() => {
    // `isDark` ga bog'lanamiz — mavzu almashganda ramka rangi yangilanadi.
    appStore.isDark
    const border = tokenColor('--fig-block-bg')

    return {
      tooltip: {
        // `body` ga ko'chiriladi: aks holda `.main-content` dagi
        // `overflow-x: hidden` tooltipni kontent chegarasida kesadi.
        appendTo: 'body',
        backgroundColor: tokenColor('--surface-section'),
        borderColor: tokenColor('--surface-line'),
        textStyle: { color: tokenColor('--fig-text-primary'), fontSize: 12 },
        formatter: ({ data }) => `${data.name}<br/>${toCount(data.value)} · ${toRoundPercent(data.percent)}`
      },
      series: [
        {
          type: 'treemap',
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          itemStyle: { borderColor: border, borderWidth: 3, gapWidth: 3, borderRadius: 8 },
          label: {
            show: true,
            position: 'insideTopLeft',
            color: '#ffffff',
            fontSize: 12,
            lineHeight: 16,
            formatter: ({ data }) =>
              `{name|${data.name}}\n{value|${toCount(data.value)} · ${toRoundPercent(data.percent)}}`,
            rich: {
              name: { color: '#ffffff', fontSize: 12, lineHeight: 16 },
              value: { color: '#ffffff', fontSize: 12, lineHeight: 16, fontWeight: 600 }
            }
          },
          data: items.value.map((item) => ({
            name: item.label,
            value: item.count,
            percent: item.percent,
            itemStyle: { color: item.color }
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
    :title="$t('dashboardPage.dismissal.title')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="p-2"
    @action="$emit('detail')"
  >
    <div class="min-h-[200px] flex-1">
      <v-chart autoresize :option="option" class="h-full min-h-[200px] w-full" />
    </div>
  </FigPanel>
</template>
