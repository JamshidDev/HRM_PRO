<script setup>
  /**
   * Figma v3 · Tab 2 "Vakansiya yoshi" (node 2959:59211).
   *
   * Yuqorida uch segmentli 100 % bar (vakansiya qancha vaqtdan beri ochiq),
   * ostida har bir guruh uchun chap tomonida rangli chegara bo'lgan qator:
   * nom, son, ulush va o'zgarish.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigStackedBar from '../fig/FigStackedBar.vue'
  import FigTrend from '../fig/FigTrend.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount, toRoundPercent, share } from '../../format.js'

  defineEmits(['detail'])

  const store = useDashboardStore()
  const { t } = i18n.global

  // Maketda: 10 kundan kam — yashil, 10–90 kun — amber, 90 kundan ortiq — qizil
  const TOKENS = {
    lt_10: '--fig-icon-green',
    '10_90': '--fig-icon-amber',
    gt_90: '--fig-icon-red'
  }

  const card = computed(() => store.movement.vacancy_age || {})
  const isMock = computed(() => store.isMock('movement', 'vacancy_age'))

  const buckets = computed(() =>
    (card.value.buckets || []).map((item) => ({
      ...item,
      label: item.label ?? t(`dashboardPage.vacancy.buckets.${item.key}`),
      percent: item.percent ?? share(item.count, card.value.total),
      token: TOKENS[item.key] || '--fig-icon-brand'
    }))
  )
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.vacancy.ageTitle')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="px-4 pt-2 pb-2 gap-3"
    @action="$emit('detail')"
  >
    <FigStackedBar :items="buckets" />

    <div class="flex flex-col gap-1.5">
      <div
        v-for="bucket in buckets"
        :key="bucket.key"
        class="flex items-center gap-2 rounded-lg bg-fig-block px-3 py-2.5"
      >
        <span
          class="h-6 w-0.5 shrink-0 rounded-[2px]"
          :style="{ backgroundColor: `var(${bucket.token})` }"
        ></span>
        <p class="min-w-0 flex-1 truncate text-[12px] leading-4 text-fig-text-secondary">
          {{ bucket.label }}
        </p>
        <p
          class="w-[44px] shrink-0 text-right text-[12px] leading-4 font-semibold text-fig-text-primary"
        >
          {{ toCount(bucket.count) }}
        </p>
        <p class="w-[40px] shrink-0 text-right text-[12px] leading-4 text-fig-text-tertiary">
          {{ toRoundPercent(bucket.percent) }}
        </p>
        <div class="w-[104px] shrink-0">
          <FigTrend :metric="bucket" unit="count" :label-key="null" />
        </div>
      </div>
    </div>
  </FigPanel>
</template>
