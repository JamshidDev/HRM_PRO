<script setup>
  /**
   * Figma v3 · Tab 2 "Nogironlik bo'yicha" (node 2959:59253).
   *
   * Chapda umumiy son va guruhlar ro'yxati (2px rangli chiziqli "Details Line"),
   * o'ngda 200px donut. `type` bo'yicha uchta variant: ishchi nogironligi,
   * qarindosh nogironligi va kasallik varaqalari.
   */
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { PieChart } from 'echarts/charts'
  import { TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import HeadDisability from '@/assets/icons/hrmDashboard/head-disability.svg'
  import HeadMedicalFile from '@/assets/icons/hrmDashboard/head-medical-file.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigDetailLine from '../fig/FigDetailLine.vue'
  import { useDashboardStore, useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'

  use([TooltipComponent, PieChart, CanvasRenderer])

  const props = defineProps({
    type: {
      type: String,
      required: true // 'worker' | 'relative' | 'sickLeave'
    }
  })

  const emit = defineEmits(['detail'])

  const store = useDashboardStore()
  const appStore = useAppStore()
  const { t } = i18n.global

  const TOKENS = ['--fig-icon-green', '--fig-icon-brand', '--fig-icon-amber']

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  // Backend guruhlarni to'liq qaytarmasligi mumkin — uchtasi ham doim chiziladi.
  const normalizeLevels = (levels = []) =>
    [1, 2, 3].map((lvl) => ({
      label: `${lvl}-${t('dashboardPage.disability.group')}`,
      count: levels.find((l) => l.level === lvl)?.count ?? 0
    }))

  const config = computed(() => {
    const d = store.dashboard?.disabilityCard
    if (!d) return null
    switch (props.type) {
      case 'worker':
        return {
          titleKey: 'dashboardPage.disability.workerTitle',
          icon: HeadDisability,
          tint: 'blue',
          hasDetail: true,
          total: d.workerDisability?.total_count ?? 0,
          rows: normalizeLevels(d.workerDisability?.levels)
        }
      case 'relative':
        return {
          titleKey: 'dashboardPage.disability.relativeTitle',
          icon: HeadDisability,
          tint: 'blue',
          hasDetail: true,
          total: d.relativeDisability?.total_count ?? 0,
          rows: normalizeLevels(d.relativeDisability?.levels)
        }
      default:
        return {
          titleKey: 'dashboardPage.disability.sickLeaveTitle',
          icon: HeadMedicalFile,
          tint: 'red',
          hasDetail: false,
          total: d.sickLeave?.total_count ?? 0,
          rows: [
            { label: t('dashboardPage.disability.active'), count: d.sickLeave?.active_count ?? 0 },
            { label: t('dashboardPage.disability.finished'), count: d.sickLeave?.finished_count ?? 0 }
          ]
        }
    }
  })

  const option = computed(() => {
    // `isDark` ga bog'lanamiz — mavzu almashganda segment ranglari yangilanadi.
    appStore.isDark
    if (!config.value) return {}

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
          data: config.value.rows.map((row, idx) => ({
            value: row.count,
            name: row.label,
            itemStyle: { color: tokenColor(TOKENS[idx % TOKENS.length]) }
          }))
        }
      ]
    }
  })

  const format = (value) => Utils.formatNumberToMoney(value) || String(value ?? 0)
</script>

<template>
  <FigPanel
    v-if="config"
    muted
    :tint="config.tint"
    :icon="config.icon"
    :title="$t(config.titleKey)"
    :action-text="config.hasDetail ? $t('content.detail') : null"
    :inner="false"
    @action="emit('detail')"
  >
    <div class="flex flex-wrap items-center gap-5 pr-2 pb-2 pl-2">
      <div class="flex min-w-[200px] flex-1 flex-col gap-4 py-1.5">
        <p class="text-[20px] leading-[30px] font-semibold whitespace-nowrap text-fig-text-primary">
          {{ format(config.total) }}
        </p>
        <div class="flex flex-col gap-1">
          <FigDetailLine
            v-for="(row, idx) in config.rows"
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
