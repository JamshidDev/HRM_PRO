<script setup>
  /**
   * Figma v3 · Tab 3 "Ta'til holati" (node 2959:59756).
   *
   * Maketda ustunlar bo'lim kesimida va uch qatlamli (chiqqan / rejada /
   * yig'ilib qolgan). Backend `vacation_types` faqat ta'til turi bo'yicha faol
   * ta'tillar sonini beradi, shuning uchun ustunlar tur kesimida va bitta
   * qatlamli chiziladi; pastda esa turlar legendasi turadi.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigColumns from '../fig/FigColumns.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useDashboardStore()

  const TOKENS = [
    '--fig-icon-green',
    '--fig-icon-brand',
    '--fig-icon-amber',
    '--fig-icon-indigo',
    '--fig-icon-purple',
    '--fig-icon-orange',
    '--fig-icon-red'
  ]

  const items = computed(() =>
    (store.dashboard.vacations || []).map((item, idx) => ({
      name: item.name,
      value: item.active_vacations ?? 0,
      token: TOKENS[idx % TOKENS.length]
    }))
  )

  const total = computed(() => items.value.reduce((sum, item) => sum + item.value, 0))
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.vacation.statusTitle')"
    inner-class="px-4 pt-2 pb-3 gap-2.5"
  >
    <p class="text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
      {{ Utils.formatNumberToMoney(total) || 0 }}
    </p>
    <FigColumns :items="items" :height="120" />
  </FigPanel>
</template>
