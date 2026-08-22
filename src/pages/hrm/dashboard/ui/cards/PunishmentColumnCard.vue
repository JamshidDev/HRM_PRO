<script setup>
  /**
   * Figma v3 · Tab 3 "Intizomiy jazo turlari" (node 2959:59930).
   *
   * Yuqorida jami son va o'tgan yilga nisbatan o'zgarish, ostida har bir tur
   * uchun ustun: tepada soni, pastda nomi va `41 % · ▲ 18 %` izohi.
   *
   * Turlar soni backenddan kelgani bo'yicha chiziladi.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigColumns from '../fig/FigColumns.vue'
  import FigTrend from '../fig/FigTrend.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount, share, sumBy } from '../../format.js'

  defineEmits(['detail'])

  const store = useDashboardStore()
  const { t } = i18n.global

  // Maketdagi ustun ranglari tartibi
  const TOKENS = ['--fig-icon-red', '--fig-icon-orange', '--fig-icon-amber', '--fig-icon-purple']

  const card = computed(() => store.attendance.disciplinary_types || {})
  const isMock = computed(() => store.isMock('attendance', 'disciplinary_types'))

  const sum = computed(() => sumBy(card.value.items, 'count'))

  const items = computed(() =>
    (card.value.items || []).map((item, idx) => ({
      name: item.label ?? t(`dashboardPage.disciplinary.types.${item.key}`),
      value: item.count ?? 0,
      percent: item.percent ?? share(item.count, sum.value),
      metric: item,
      token: TOKENS[idx % TOKENS.length]
    }))
  )
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.rewardCard.punishment.title')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="px-4 pt-2 pb-3 gap-2.5"
    @action="$emit('detail')"
  >
    <div class="flex flex-col gap-1">
      <p class="text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
        {{ toCount(card.total?.value) }}
      </p>
      <FigTrend :metric="card.total" unit="count" />
    </div>
    <FigColumns :items="items" :height="120" trend-unit="percent" />
  </FigPanel>
</template>
