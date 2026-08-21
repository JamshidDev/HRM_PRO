<script setup>
  /**
   * Figma v3 · Tab 3 "Rag'batlantirish turlari" (node 2959:59899).
   *
   * Yuqorida jami son va o'tgan yilga nisbatan o'zgarish, ostidagi
   * `bg-secondary` blokda har bir tur uchun halqa: markazida ulush foizi va
   * soni, ostida nomi va o'zgarishi.
   *
   * Turlar soni backenddan kelgani bo'yicha chiziladi — maketda uchta, ammo
   * ma'lumotnomada boshqacha bo'lsa ham karta moslashadi.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigRadial from '../fig/FigRadial.vue'
  import FigTrend from '../fig/FigTrend.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount, share, sumBy } from '../../format.js'

  defineEmits(['detail'])

  const store = useDashboardStore()
  const { t } = i18n.global

  // Maketdagi halqa ranglari tartibi
  const TOKENS = [
    '--fig-icon-green',
    '--fig-icon-brand',
    '--fig-icon-purple',
    '--fig-icon-amber',
    '--fig-icon-indigo'
  ]

  const card = computed(() => store.attendance.incentive_types || {})
  const isMock = computed(() => store.isMock('attendance', 'incentive_types'))

  const sum = computed(() => sumBy(card.value.items, 'count'))

  const items = computed(() =>
    (card.value.items || []).map((item, idx) => ({
      ...item,
      label: item.label ?? t(`dashboardPage.incentive.types.${item.key}`),
      percent: item.percent ?? share(item.count, sum.value),
      token: TOKENS[idx % TOKENS.length]
    }))
  )
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.rewardCard.reward.title')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    :inner="false"
    @action="$emit('detail')"
  >
    <div class="flex flex-col gap-1 px-2 pb-3">
      <p class="text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
        {{ toCount(card.total?.value) }}
      </p>
      <FigTrend :metric="card.total" unit="count" />
    </div>

    <div class="mt-auto flex flex-wrap justify-around gap-4 rounded-xl bg-fig-bg-secondary px-4 py-4">
      <div v-for="item in items" :key="item.key" class="flex flex-col items-center gap-2">
        <FigRadial :percent="item.percent" :count="item.count" :token="item.token" />
        <p class="max-w-[140px] text-center text-[12px] leading-4 text-fig-text-secondary">
          {{ item.label }}
        </p>
        <FigTrend :metric="item" unit="count" :label-key="null" small />
      </div>
    </div>
  </FigPanel>
</template>
