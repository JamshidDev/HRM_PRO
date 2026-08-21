<script setup>
  /**
   * Figma v3 · Tab 2 "Yaqinlashayotgan hodisalar — vaqt o'qi" (node 2959:59323).
   *
   * Vaqt o'qida 7/14/30/60/90 kunlik markerlar; har birida "N xodim" va hodisa
   * nomi. Pastda jami hodisa soni va o'tgan yilga nisbatan o'zgarish.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigTimeline from '../fig/FigTimeline.vue'
  import FigTrend from '../fig/FigTrend.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount } from '../../format.js'

  defineEmits(['detail'])

  const store = useDashboardStore()
  const { t } = i18n.global

  // Maketdagi marker ranglari tartibi
  const TOKENS = [
    '--fig-icon-brand',
    '--fig-icon-amber',
    '--fig-icon-amber',
    '--fig-icon-red',
    '--fig-icon-purple'
  ]

  const card = computed(() => store.movement.upcoming_events || {})
  const isMock = computed(() => store.isMock('movement', 'upcoming_events'))

  const items = computed(() =>
    (card.value.items || []).map((item, idx) => ({
      days: t('dashboardPage.events.days', { count: item.days }),
      count: t('dashboardPage.events.workers', { count: item.workers_count }),
      title: item.label ?? t(`dashboardPage.events.types.${item.key}`),
      token: TOKENS[idx % TOKENS.length]
    }))
  )
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.events.title')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="px-4 pt-1 pb-2"
    @action="$emit('detail')"
  >
    <FigTimeline :items="items" />

    <div class="mt-auto flex flex-wrap items-center gap-2 pt-1">
      <p class="text-[12px] leading-4 text-fig-text-tertiary">
        {{ $t('dashboardPage.events.footer', { count: toCount(card.total?.value) }) }}
      </p>
      <FigTrend :metric="card.total" unit="count" :label-key="null" />
    </div>
  </FigPanel>
</template>
