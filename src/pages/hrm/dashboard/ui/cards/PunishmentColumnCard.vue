<script setup>
  /**
   * Figma v3 · Tab 3 "Intizomiy jazo — ustun" (node 2959:59898).
   *
   * Maketdagi uch ustun o'rniga backend ikkita turni beradi (hayfsan va boshqa
   * jazolar) — ustunlar shu ikkitasi bo'yicha chiziladi.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigColumns from '../fig/FigColumns.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'

  const emit = defineEmits(['detail'])

  const store = useDashboardStore()
  const { t } = i18n.global

  const items = computed(() => [
    {
      name: t('dashboardPage.rewardCard.punishment.typeOne'),
      value: store.dashboard.disciplinaryFineCount ?? 0,
      token: '--fig-icon-red'
    },
    {
      name: t('dashboardPage.rewardCard.punishment.typeTwo'),
      value: store.dashboard.disciplinaryCount ?? 0,
      token: '--fig-icon-orange'
    }
  ])

  const total = computed(() => items.value.reduce((sum, item) => sum + item.value, 0))
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.rewardCard.punishment.title')"
    :action-text="$t('content.detail')"
    inner-class="px-4 pt-2 pb-3 gap-2.5"
    @action="emit('detail')"
  >
    <p class="text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
      {{ Utils.formatNumberToMoney(total) || 0 }}
    </p>
    <FigColumns :items="items" :height="120" />
  </FigPanel>
</template>
