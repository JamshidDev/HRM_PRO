<script setup>
  /**
   * Figma v3 · Tab 2 "Ishga qabul — shartnoma turlari" (node 2959:59021).
   *
   * Backend `contract_types` ni `{type, active_contracts}` ko'rinishida beradi —
   * har bir tur maketdagi kabi alohida ustun bo'lib chiziladi.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigColumns from '../fig/FigColumns.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useDashboardStore()

  // Maketdagi ustun ranglari tartibi
  const TOKENS = [
    '--fig-icon-green',
    '--fig-icon-brand',
    '--fig-icon-indigo',
    '--fig-icon-purple',
    '--fig-icon-amber',
    '--fig-icon-orange',
    '--fig-icon-red'
  ]

  const items = computed(() =>
    (store.dashboard.contractTypes || []).map((item, idx) => ({
      name: item.type,
      value: item.active_contracts ?? 0,
      token: TOKENS[idx % TOKENS.length]
    }))
  )

  const total = computed(() => items.value.reduce((sum, item) => sum + item.value, 0))
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.contract.title')"
    inner-class="px-4 pt-2 pb-3 gap-2.5"
  >
    <p class="text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
      {{ Utils.formatNumberToMoney(total) || 0 }}
    </p>
    <FigColumns :items="items" :height="120" />
  </FigPanel>
</template>
