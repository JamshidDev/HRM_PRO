<script setup>
  import { useIntegrationLogStore } from '@/store/modules/index.js'
  import { colorMap } from './useHelpers.js'
  import i18n from '@/i18n/index.js'
  import {
    CheckmarkCircle24Regular,
    DismissCircle24Regular,
    Flash24Regular,
    Timer24Regular,
    People24Regular,
    ArrowTrending24Regular
  } from '@vicons/fluent'

  const store = useIntegrationLogStore()
  const { t } = i18n.global

  const sparklineMax = computed(() =>
    Math.max(...store.timeline.map((v) => v.total_requests), 1)
  )

  const statCards = computed(() => {
    const s = store.summary
    if (!s) return []
    const successPct   = s.total_requests ? (s.success_requests / s.total_requests) * 100 : 0
    const errorPct     = s.total_requests ? (s.error_requests   / s.total_requests) * 100 : 0
    const avgMs        = parseFloat(s.avg_duration_ms)
    const maxMs        = s.max_duration_ms
    const avgGaugePct  = Math.min((avgMs / 2000) * 100, 100)
    const maxGaugePct  = Math.min((maxMs / 2000) * 100, 100)

    return [
      {
        label:    t('integrationLog.dashboard.totalRequests'),
        value:    s.total_requests.toLocaleString(),
        icon:     ArrowTrending24Regular,
        color:    'primary',
        type:     'sparkline',
        badge:    null
      },
      {
        label:    t('integrationLog.dashboard.successRequests'),
        value:    s.success_requests.toLocaleString(),
        icon:     CheckmarkCircle24Regular,
        color:    'success',
        type:     'ring',
        pct:      successPct,
        badge:    `${successPct.toFixed(1)}%`
      },
      {
        label:    t('integrationLog.dashboard.errorRequests'),
        value:    s.error_requests.toLocaleString(),
        icon:     DismissCircle24Regular,
        color:    'danger',
        type:     'ring',
        pct:      errorPct,
        badge:    `${errorPct.toFixed(1)}%`
      },
      {
        label:    t('integrationLog.dashboard.avgDuration'),
        value:    `${avgMs.toFixed(0)} ms`,
        icon:     Timer24Regular,
        color:    'warning',
        type:     'gauge',
        gaugePct: avgGaugePct,
        badge:    avgMs < 200
          ? t('integrationLog.dashboard.fast')
          : avgMs <= 500
            ? t('integrationLog.dashboard.medium')
            : t('integrationLog.dashboard.slow')
      },
      {
        label:    t('integrationLog.dashboard.maxDuration'),
        value:    `${maxMs} ms`,
        icon:     Flash24Regular,
        color:    maxMs < 500 ? 'success' : maxMs <= 1500 ? 'warning' : 'danger',
        type:     'gauge',
        gaugePct: maxGaugePct,
        badge:    null
      },
      {
        label:    t('integrationLog.dashboard.uniqueClients'),
        value:    s.unique_clients,
        icon:     People24Regular,
        color:    'info',
        type:     'dots',
        dotCount: s.unique_clients,
        badge:    null
      }
    ]
  })
</script>

<template>
  <template v-for="(card, i) in statCards" :key="i">
    <div class="xl:col-span-2 md:col-span-4 col-span-6 hover-effect-card cursor-pointer px-3 pt-2.5 pb-2 rounded-xl bg-surface-section border border-surface-line relative overflow-hidden flex flex-col min-h-[110px]">

      <!-- Top row: icon box + badge -->
      <div class="flex items-start justify-between z-10 relative">
        <div :class="colorMap[card.color].icon"
          class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
          <n-icon size="16"><component :is="card.icon" /></n-icon>
        </div>
        <span v-if="card.badge"
          :class="[colorMap[card.color].bg, colorMap[card.color].text]"
          class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-[1.5] flex-shrink-0">
          {{ card.badge }}
        </span>
      </div>

      <!-- Value + label -->
      <div class="z-10 relative mt-2 flex-1">
        <p class="text-[15px] font-bold text-textColor0 leading-tight">{{ card.value }}</p>
        <p class="text-[10px] font-medium text-textColor3 mt-0.5 line-clamp-1">{{ card.label }}</p>
      </div>

      <!-- Ring progress bar -->
      <div v-if="card.type === 'ring'" class="mt-1.5 z-10 relative">
        <div class="h-1.5 rounded-full bg-surface-ground overflow-hidden">
          <div
            :class="colorMap[card.color].bar"
            class="h-full rounded-full transition-all duration-700"
            :style="{ width: card.pct + '%' }"
          />
        </div>
      </div>

      <!-- Sparkline -->
      <div v-if="card.type === 'sparkline' && store.timeline.length"
        class="flex items-end gap-[2px] h-[18px] mt-1.5 z-10 relative">
        <div
          v-for="(day, di) in store.timeline" :key="di"
          :class="colorMap[card.color].bg"
          class="flex-1 rounded-sm transition-all duration-500"
          :style="{ height: `${Math.max(3, (day.total_requests / sparklineMax) * 18)}px` }"
        />
      </div>

      <!-- Speed gauge -->
      <div v-else-if="card.type === 'gauge'" class="mt-1.5 z-10 relative">
        <div class="h-1.5 rounded-full overflow-hidden flex">
          <div class="flex-1 bg-success/30 rounded-l-full" />
          <div class="flex-1 bg-warning/30" />
          <div class="flex-1 bg-danger/30 rounded-r-full" />
        </div>
        <div class="relative h-0">
          <div
            class="absolute -top-[10px] w-2.5 h-2.5 rounded-full border-2 border-white shadow-md transition-all duration-700"
            :class="colorMap[card.color].bg.replace('/10', '/80')"
            :style="{ left: `calc(${card.gaugePct}% - 5px)` }"
          />
        </div>
        <div class="flex justify-between mt-1">
          <span class="text-[9px] font-medium text-textColor3">0</span>
          <span class="text-[9px] font-medium text-textColor3">2000ms</span>
        </div>
      </div>

      <!-- Dots -->
      <div v-else-if="card.type === 'dots'" class="flex flex-wrap gap-1 mt-1.5 z-10 relative">
        <div
          v-for="n in Math.min(card.dotCount, 10)" :key="n"
          :class="colorMap[card.color].icon"
          class="w-5 h-5 rounded-full flex items-center justify-center">
          <n-icon size="11"><People24Regular /></n-icon>
        </div>
      </div>

      <!-- BG effect -->
      <span class="z-1 opacity-20 absolute top-0 right-0 w-[110px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]" />
    </div>
  </template>
</template>
