<script setup>
  import HeadBell from '@/assets/icons/accDashboard/head-bell.svg'
  import AlertChartDown from '@/assets/icons/accDashboard/alert-chart-down.svg'
  import AlertTriangle from '@/assets/icons/accDashboard/alert-triangle.svg'
  import AlertFile from '@/assets/icons/accDashboard/alert-file.svg'
  import AlertCheck from '@/assets/icons/accDashboard/alert-check.svg'
  import PanelHeader from './PanelHeader.vue'
  import { useAccDashboardStore } from '@/store/modules/index.js'
  import { toPercent } from '../format.js'

  const store = useAccDashboardStore()

  // Maketdagi to'rt xil ogohlantirish uslubi.
  const STYLES = {
    danger: { icon: AlertChartDown, box: 'bg-fig-red-50', text: 'text-fig-text-red' },
    warning: { icon: AlertTriangle, box: 'bg-fig-chip-amber', text: 'text-fig-chip-amber-text' },
    mismatch: { icon: AlertFile, box: 'bg-fig-chip-amber', text: 'text-fig-chip-amber-text' },
    success: { icon: AlertCheck, box: 'bg-fig-chip-green', text: 'text-fig-text-green' }
  }
</script>

<template>
  <div class="flex h-full flex-col rounded-2xl bg-fig-block px-1 pb-1">
    <PanelHeader tint="pink" :icon="HeadBell" :title="$t('accDashboard.panel.attention')" />

    <div class="flex flex-1 flex-col gap-2.5 px-2 pb-2">
      <div
        v-for="(item, index) in store.alerts"
        :key="index"
        class="flex w-full items-center gap-2 rounded-lg p-2"
        :class="STYLES[item.type].box"
      >
        <span class="flex h-5 w-5 shrink-0 items-center justify-center">
          <component :is="STYLES[item.type].icon" />
        </span>
        <p class="min-w-0 flex-1 text-[12px] leading-4 font-medium" :class="STYLES[item.type].text">
          {{
            $t(item.messageKey, {
              name: item.card ? $t(item.card.titleKey) : '',
              percent: item.card ? toPercent(item.card.delta?.percent) : ''
            })
          }}
        </p>
      </div>

      <p
        v-if="!store.alerts.length"
        class="flex flex-1 items-center justify-center px-2 py-6 text-center text-[12px] leading-4 text-fig-text-tertiary"
      >
        {{ $t('accDashboard.panel.no_alerts') }}
      </p>
    </div>

    <div class="mt-auto flex items-center justify-between border-t border-fig-br-disable px-2 py-2">
      <p class="text-[12px] leading-4 text-fig-text-tertiary">
        {{ $t('accDashboard.panel.alert_count', { count: store.alerts.length }) }}
      </p>
    </div>
  </div>
</template>
