<script setup>
  /**
   * Figma v3 · Tab 1 "Bugungi holat" (node 2959:58379).
   *
   * Chapda donut — markazida jami son, o'ngda esa har bir holat
   * uchun bitta qator: rangli kvadrat, nom, jami son, ayol va erkak soni.
   * Ta'til turlari va xizmat safari BITTA darajada — yig'ma qator yo'q.
   */
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { PieChart } from 'echarts/charts'
  import { TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import { useDashboardStore, useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount } from '../../format.js'

  use([TooltipComponent, PieChart, CanvasRenderer])

  const store = useDashboardStore()
  const appStore = useAppStore()
  const { t } = i18n.global

  // Har ta'til turi (VacationTypeEnum 1..8) va xizmat safari — alohida rang.
  const TOKENS = {
    vacation_1: '--fig-icon-green',
    vacation_2: '--fig-icon-pink',
    vacation_3: '--fig-icon-brand',
    vacation_4: '--fig-blue-300',
    vacation_5: '--fig-icon-purple',
    vacation_6: '--fig-icon-amber',
    vacation_7: '--fig-icon-orange',
    vacation_8: '--fig-icon-yellow',
    business_trip: '--fig-icon-indigo'
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

  /** Markazda — bugun ish o'rnida bo'lmaganlar jami (ta'til + xizmat safari). */
  const awayTotal = computed(() =>
    rows.value.reduce((sum, row) => sum + Number(row.count || 0), 0)
  )

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
    :mock="isMock"
    :inner="false"
  >
    <div class="flex flex-wrap items-center gap-4 px-2 pb-2">
      <div class="relative h-[150px] w-[150px] shrink-0">
        <v-chart autoresize :option="option" class="h-full w-full" />
        <div
          class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5"
        >
          <p class="text-[20px] leading-6 font-semibold text-fig-text-primary">
            {{ toCount(awayTotal) }}
          </p>
        </div>
      </div>

      <div
        class="min-w-[280px] flex-1 overflow-hidden rounded-xl border border-fig-br-disable"
      >
        <table class="today-table w-full border-collapse text-[13px] leading-[18px]">
          <thead>
            <tr>
              <th class="text-left font-medium text-fig-text-tertiary">
                {{ $t('dashboardPage.today.status') }}
              </th>
              <th class="w-[72px] text-right font-medium text-fig-text-tertiary">
                {{ $t('content.count') }}
              </th>
              <th class="w-[68px] text-right font-medium text-fig-text-tertiary">
                {{ $t('enum.woman') }}
              </th>
              <th class="w-[68px] text-right font-medium text-fig-text-tertiary">
                {{ $t('enum.man') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.key">
              <td class="text-fig-text-secondary">
                <span class="flex items-center gap-2.5">
                  <span
                    class="h-3 w-3 shrink-0 rounded-[3px]"
                    :style="{ backgroundColor: `var(${row.token})` }"
                  ></span>
                  <span class="min-w-0 truncate">{{ row.label }}</span>
                </span>
              </td>
              <td class="text-right font-bold whitespace-nowrap text-fig-text-primary">
                {{ toCount(row.count) }}
              </td>
              <td class="text-right whitespace-nowrap text-fig-text-tertiary">
                {{ toCount(row.female) }}
              </td>
              <td class="text-right whitespace-nowrap text-fig-text-tertiary">
                {{ toCount(row.male) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </FigPanel>
</template>

<style scoped>
  /* Jadval to'ri emas — faqat qatorlar orasidagi ajratgich; tashqi chegara
     va burchak radiusi o'ram div'da. */
  .today-table th,
  .today-table td {
    padding: 6px 10px;
  }

  .today-table th {
    background: var(--fig-bg-secondary);
    border-bottom: 1px solid var(--fig-br-disable);
    font-size: 11px;
    line-height: 16px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .today-table tbody td {
    border-top: 1px solid var(--fig-br-disable);
  }

  .today-table tbody tr:first-child td {
    border-top: none;
  }

  /* Sonlar ustunma-ustun tik tursin. */
  .today-table td:not(:first-child),
  .today-table th:not(:first-child) {
    font-variant-numeric: tabular-nums;
  }

  .today-table tbody tr:hover td {
    background: var(--fig-bg-secondary);
  }
</style>
