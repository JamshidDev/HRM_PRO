<script setup>
  /**
   * Figma v3 · Tab 3 "Rag'batlantirish — radial" (node 2959:59898).
   *
   * Yuqorida jami son, ostidagi `bg-secondary` blokda har bir tur uchun halqa:
   * markazda ulush foizi va soni, ostida nomi.
   *
   * Backend rag'batlantirishlarni ikki turga ajratadi (faxriy unvon va boshqa
   * mukofotlar) — maketdagi uchinchi halqa uchun ma'lumot yo'q.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigRadial from '../fig/FigRadial.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const emit = defineEmits(['detail'])

  const store = useDashboardStore()

  const items = computed(() => {
    const gift = store.dashboard.incentivesGiftCount ?? 0
    const other = store.dashboard.incentivesCount ?? 0
    const sum = gift + other
    const share = (value) => (sum ? (value / sum) * 100 : 0)
    return [
      {
        label: 'dashboardPage.rewardCard.reward.typeOne',
        count: gift,
        percent: share(gift),
        token: '--fig-icon-green'
      },
      {
        label: 'dashboardPage.rewardCard.reward.typeTwo',
        count: other,
        percent: share(other),
        token: '--fig-icon-brand'
      }
    ]
  })

  const total = computed(() => items.value.reduce((sum, item) => sum + item.count, 0))
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.rewardCard.reward.title')"
    :action-text="$t('content.detail')"
    :inner="false"
    @action="emit('detail')"
  >
    <p class="px-2 pb-3 text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
      {{ Utils.formatNumberToMoney(total) || 0 }}
    </p>

    <div class="mt-auto flex flex-wrap justify-around gap-4 rounded-xl bg-fig-bg-secondary px-4 py-4">
      <div v-for="(item, idx) in items" :key="idx" class="flex flex-col items-center gap-2">
        <FigRadial :percent="item.percent" :count="item.count" :token="item.token" />
        <p class="max-w-[140px] text-center text-[12px] leading-4 text-fig-text-secondary">
          {{ $t(item.label) }}
        </p>
      </div>
    </div>
  </FigPanel>
</template>
