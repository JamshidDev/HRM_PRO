<script setup>
  import { useIntegrationLogStore } from '@/store/modules/index.js'
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { PieChart } from 'echarts/charts'
  import { TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { methodColors, methodBadgeClass, statusColor } from './useHelpers.js'
  import i18n from '@/i18n/index.js'

  use([PieChart, TooltipComponent, CanvasRenderer])

  const store = useIntegrationLogStore()
  const { t } = i18n.global

  const methodOption = computed(() => ({
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}: ${p.value.toLocaleString()} (${p.percent}%)`
    },
    series: [
      {
        type: 'pie',
        radius: '88%',
        center: ['50%', '50%'],
        data: store.methods.map((v) => ({
          name: v.method,
          value: v.total_requests,
          itemStyle: {
            color: methodColors[v.method] || '#999',
            borderRadius: 6,
            borderColor: '#ffffff',
            borderWidth: 2
          }
        })),
        emphasis: {
          itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.2)' },
          scale: true,
          scaleSize: 4
        },
        label: {
          show: true,
          position: 'inside',
          formatter: (p) => `${p.name}\n${p.percent}%`,
          color: '#fff',
          fontSize: 11,
          fontWeight: 'bold',
          lineHeight: 16
        },
        labelLine: { show: false }
      }
    ]
  }))

  const statusLabel = (code) => {
    const map = {
      200: t('integrationLog.dashboard.statusLabel.ok'),
      302: t('integrationLog.dashboard.statusLabel.redirect'),
      400: t('integrationLog.dashboard.statusLabel.badRequest'),
      404: t('integrationLog.dashboard.statusLabel.notFound'),
      422: t('integrationLog.dashboard.statusLabel.unprocessable'),
      500: t('integrationLog.dashboard.statusLabel.serverError')
    }
    return map[code] ?? t('integrationLog.dashboard.statusLabel.unknown')
  }
</script>

<template>
  <div class="xl:col-span-4 col-span-12 h-full">
    <div class="bg-surface-section border border-surface-line rounded-xl h-full flex flex-col">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-surface-line flex items-center justify-between rounded-t-xl">
        <h3 class="font-semibold text-sm text-textColor1">{{ $t('integrationLog.dashboard.methods') }}</h3>
        <span class="text-[11px] font-medium text-textColor3">{{ $t('integrationLog.dashboard.statuses') }}</span>
      </div>

      <!-- Pie chart + method legend -->
      <div class="flex items-center px-2 pt-2 pb-1">
        <div class="w-[130px] h-[130px] flex-shrink-0">
          <v-chart autoresize :option="methodOption" />
        </div>
        <div class="flex-1 flex flex-col gap-2 pl-2">
          <div
            v-for="m in store.methods"
            :key="m.method"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full flex-shrink-0"
                :style="{ background: methodColors[m.method] || '#999' }" />
              <span :class="methodBadgeClass(m.method)"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded">
                {{ m.method }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold text-textColor0">{{ m.total_requests.toLocaleString() }}</p>
              <p class="text-[10px] font-medium text-textColor3">
                {{ ((m.total_requests / (store.summary?.total_requests || 1)) * 100).toFixed(1) }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="mx-4 border-t border-surface-line" />

      <!-- Statuses — 2 column grid -->
      <div class="grid grid-cols-2 gap-x-3 gap-y-2 px-4 py-3 flex-1">
        <div v-for="s in store.statuses" :key="s.response_status">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-1.5">
              <span
                :class="statusColor(s.response_status).bg"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded w-10 text-center leading-[1.5]">
                {{ s.response_status }}
              </span>
              <span class="text-[10px] font-bold text-textColor3">{{ statusLabel(s.response_status) }}</span>
            </div>
            <span class="text-[10px] font-semibold text-textColor0">
              {{ s.total_requests.toLocaleString() }}
            </span>
          </div>
          <div class="h-1 rounded-full bg-surface-ground overflow-hidden">
            <div
              :class="statusColor(s.response_status).bar"
              class="h-full rounded-full transition-all duration-700"
              :style="{ width: `${(s.total_requests / (store.summary?.total_requests || 1)) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
