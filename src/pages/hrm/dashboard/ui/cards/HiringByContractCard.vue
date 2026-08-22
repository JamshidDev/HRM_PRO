<script setup>
  /**
   * Figma v3 · Tab 2 "Ishga qabul — shartnoma turlari" (node 2959:59022).
   *
   * Beshta ustun: tepada qabul qilinganlar soni, pastda tur nomi va
   * `47 % · ▲ 16 %` izohi.
   *
   * Diqqat: bu ko'rsatkich *davr ichida ishga qabul qilinganlar*ni bildiradi.
   * Hozirgi backend `contract_types[]` da *faol shartnomalar* sonini beradi —
   * boshqa ko'rsatkich, shu sababli u bu yerga ulanmagan (`adapter.js` dagi
   * izohga qarang) va karta mock ma'lumot bilan chiziladi.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigColumns from '../fig/FigColumns.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount } from '../../format.js'

  defineEmits(['detail'])

  const store = useDashboardStore()
  const { t } = i18n.global

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

  const card = computed(() => store.movement.hiring_by_contract_type || {})
  const isMock = computed(() => store.isMock('movement', 'hiring_by_contract_type'))

  const items = computed(() =>
    (card.value.items || []).map((item, idx) => ({
      name: item.label ?? t(`dashboardPage.hiring.types.${item.key}`),
      value: item.count ?? 0,
      percent: item.percent,
      metric: item,
      token: TOKENS[idx % TOKENS.length]
    }))
  )
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.hiring.title')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="px-4 pt-2 pb-3 gap-2.5"
    @action="$emit('detail')"
  >
    <p class="text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
      {{ toCount(card.total) }}
    </p>
    <FigColumns :items="items" :height="120" trend-unit="percent" />
  </FigPanel>
</template>
