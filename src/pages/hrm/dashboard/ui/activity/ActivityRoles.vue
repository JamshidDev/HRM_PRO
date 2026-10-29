<script setup>
  // «Rollar kesimida» — top-6 rol amallari donut ko'rinishida (dashboard kartalaridagi
  // donut bilan bir xil). O'rtasida jami amallar, ostida rang belgili ro'yxat: soni va ulushi.
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { PieChart } from 'echarts/charts'
  import { TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import HeadBriefcase from '@/assets/icons/hrmDashboard/activity/head-briefcase.svg?url'
  import { useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { formatCount } from './utils.js'

  use([TooltipComponent, PieChart, CanvasRenderer])

  const { t, te } = i18n.global
  const appStore = useAppStore()

  const props = defineProps({
    roles: { type: Array, default: () => [] }
  })

  // Rollar tartibi bo'yicha ranglar; eng ko'p amalli rol (birinchisi) — brend ko'k.
  const TOKENS = [
    '--fig-icon-brand',
    '--fig-icon-purple',
    '--fig-icon-green',
    '--fig-icon-amber',
    '--fig-icon-pink',
    '--fig-icon-indigo'
  ]

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const total = computed(() => props.roles.reduce((sum, r) => sum + (r.count || 0), 0))

  const rows = computed(() =>
    props.roles.map((r, idx) => {
      const key = `dashboardPage.activity.roles.${r.name}`
      return {
        ...r,
        label: te(key) ? t(key) : r.name,
        token: TOKENS[idx % TOKENS.length],
        percent: total.value ? Math.round((r.count / total.value) * 100) : 0
      }
    })
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
        formatter: (p) => `${p.marker}${p.name}: <b>${formatCount(p.value)}</b> (${p.percent}%)`,
        backgroundColor: tokenColor('--surface-section'),
        borderColor: tokenColor('--surface-line'),
        textStyle: { color: tokenColor('--fig-text-primary'), fontSize: 12 }
      },
      series: [
        {
          type: 'pie',
          radius: ['62%', '100%'],
          // Hover'da bo'lak kattalashmaydi (halqa canvas chetiga tegib turadi — kattalashsa
          // kesilib qolardi); uning o'rniga qolgan bo'laklar xiralashadi.
          emphasis: { scale: false, focus: 'self' },
          blur: { itemStyle: { opacity: 0.35 } },
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
  <div class="flex h-full flex-col gap-4 rounded-2xl bg-fig-block shadow-card p-4">
    <div class="flex w-full items-center gap-2.5">
      <span class="flex shrink-0 items-center rounded-full bg-fig-blue-100 p-1.5">
        <img :src="HeadBriefcase" alt="" width="20" height="20" class="block" />
      </span>
      <p
        class="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-semibold text-fig-text-primary"
      >
        {{ $t('dashboardPage.activity.byRoles') }}
      </p>
    </div>

    <!-- Donut, o'rtasida jami amallar soni -->
    <div class="relative mx-auto h-[160px] w-[160px] shrink-0">
      <v-chart autoresize :option="option" class="h-full w-full" />
      <div
        class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
      >
        <p class="text-[18px] leading-6 font-semibold text-fig-text-primary">
          {{ formatCount(total) }}
        </p>
        <p class="text-[11px] leading-4 text-fig-text-secondary">
          {{ $t('dashboardPage.activity.totalActions') }}
        </p>
      </div>
    </div>

    <!-- Ro'yxat: rang belgisi, rol nomi, soni va ulushi -->
    <div class="flex w-full flex-col gap-2">
      <div
        v-for="row in rows"
        :key="row.name"
        class="flex w-full items-center gap-2 leading-4 whitespace-nowrap"
      >
        <span
          class="size-2 shrink-0 rounded-full"
          :style="{ backgroundColor: `var(${row.token})` }"
        ></span>
        <p class="min-w-0 flex-1 truncate text-[12px] font-medium text-fig-text-secondary">
          {{ row.label }}
        </p>
        <p class="text-[12px] font-semibold text-fig-text-primary">
          {{ formatCount(row.count) }}
        </p>
        <p class="w-8 text-right text-[11.5px] text-[#98a2b3]">{{ row.percent }}%</p>
      </div>
    </div>
  </div>
</template>
