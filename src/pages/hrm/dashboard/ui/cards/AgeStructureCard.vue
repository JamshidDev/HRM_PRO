<script setup>
  /**
   * Figma v3 · Tab 1 "Yosh va jins bo'yicha tuzilma" (node 2959:58420).
   *
   * Uchta yosh guruhi (eski dashboard chegaralari: 30 gacha, 31–45, 46+).
   * Chapda guruhlar ro'yxati — son, ulush va jins kesimi; o'ngda ulushni
   * ko'rsatuvchi donut, markazida jami xodimlar soni.
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
  import { toCount, toRoundPercent, share } from '../../format.js'

  defineEmits(['detail'])

  use([TooltipComponent, PieChart, CanvasRenderer])

  const store = useDashboardStore()
  const appStore = useAppStore()
  const { t } = i18n.global

  // Yosh guruhi ranglari — ta'lim kartasidagi segment tartibi bilan bir xil.
  const TOKENS = ['--fig-icon-brand', '--fig-icon-purple', '--fig-icon-indigo']

  // Oxirgi guruh eski dashboard nomini oladi, qolgani — backend label'i + «yoshdagilar».
  const LABEL_KEYS = {
    '46_plus': 'dashboardPage.age.age46'
  }

  const bucketLabel = (bucket) =>
    LABEL_KEYS[bucket.key]
      ? t(LABEL_KEYS[bucket.key])
      : `${bucket.label} ${t('dashboardPage.age.yearsOld')}`

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const card = computed(() => store.overview.age_gender || {})
  const isMock = computed(() => store.isMock('overview', 'age_gender'))

  const total = computed(() =>
    (card.value.buckets || []).reduce((sum, item) => sum + Number(item.count || 0), 0)
  )

  const buckets = computed(() =>
    (card.value.buckets || []).map((item, idx) => ({
      ...item,
      token: TOKENS[idx % TOKENS.length],
      label: bucketLabel(item),
      // Backend `percent` bermasa yig'indiga nisbatan hisoblanadi.
      percent: item.percent ?? share(item.count, total.value)
    }))
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
          radius: ['62%', '100%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderRadius: 6,
            borderColor: tokenColor('--fig-block-bg'),
            borderWidth: 3
          },
          data: buckets.value.map((bucket) => ({
            value: bucket.count,
            name: bucket.label,
            itemStyle: { color: tokenColor(bucket.token) }
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
    :title="$t('dashboardPage.age.structureTitle')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    :inner="false"
    @action="$emit('detail')"
  >
    <div class="flex flex-wrap items-center gap-5 pr-2 pb-2 pl-2">
      <div class="flex min-w-[240px] flex-1 flex-col gap-1">
        <div v-for="bucket in buckets" :key="bucket.key" class="flex items-center gap-2.5 py-1 pl-1">
          <span
            class="h-9 w-1 shrink-0 rounded-full"
            :style="{ backgroundColor: `var(${bucket.token})` }"
          ></span>
          <div class="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
            <p class="truncate text-[13px] leading-[18px] font-semibold text-fig-text-primary">
              {{ bucket.label }}
            </p>
            <p class="truncate text-[12px] leading-4 text-fig-text-disable">
              {{ $t('enum.man') }}
              <span class="font-bold text-fig-text-primary">{{ toCount(bucket.male) }}</span>
              ·
              {{ $t('enum.woman') }}
              <span class="font-bold text-fig-text-primary">{{ toCount(bucket.female) }}</span>
            </p>
          </div>
          <p
            class="shrink-0 text-right text-[16px] leading-[22px] font-bold whitespace-nowrap text-fig-text-primary"
          >
            {{ toCount(bucket.count) }}
          </p>
          <p
            class="w-[40px] shrink-0 text-right text-[12px] leading-4 font-medium text-fig-text-tertiary"
          >
            {{ toRoundPercent(bucket.percent) }}
          </p>
        </div>
      </div>

      <div class="relative h-[180px] w-[180px] shrink-0">
        <v-chart autoresize :option="option" class="h-full w-full" />
        <!-- Donut markazi — jami; chart ustida, hodisalarni ushlamaydi. -->
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p class="text-[18px] leading-6 font-semibold text-fig-text-primary">
            {{ toCount(total) }}
          </p>
        </div>
      </div>
    </div>
  </FigPanel>
</template>
