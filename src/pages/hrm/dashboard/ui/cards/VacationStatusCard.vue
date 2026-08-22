<script setup>
  /**
   * Figma v3 · Tab 3 "Ta'til holati — bo'lim kesimida" (node 2959:59756).
   *
   * Har bir bo'linma uchun uch qatlamli ustun: chiqqan (yashil), rejada (ko'k)
   * va yig'ilib qolgan (amber) ta'til kunlari. Pastda uch qatlam legendasi —
   * jami kun, ulush va yig'ilib qolgan kunlar o'zgarishi.
   *
   * Backend hozir ta'tilni faqat tur kesimida beradi (`vacation_types[]`),
   * bo'linma kesimi va kunlar taqsimoti yo'q — shu sababli karta mock
   * ma'lumot bilan chiziladi (`adapter.js` dagi izohga qarang).
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigColumns from '../fig/FigColumns.vue'
  import FigTrend from '../fig/FigTrend.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import { toCount, toRoundPercent } from '../../format.js'

  defineEmits(['detail'])

  const store = useDashboardStore()

  // Maketdagi qatlam tartibi: ustun tepasida yig'ilib qolgan, pastda chiqqan
  const LAYERS = [
    { key: 'accrued', token: '--fig-icon-amber' },
    { key: 'planned', token: '--fig-icon-brand' },
    { key: 'used', token: '--fig-icon-green' }
  ]

  const card = computed(() => store.attendance.vacation_by_department || {})
  const isMock = computed(() => store.isMock('attendance', 'vacation_by_department'))

  const items = computed(() =>
    (card.value.items || []).map((item) => ({
      name: item.name,
      segments: LAYERS.map((layer) => ({ value: item[layer.key] ?? 0, token: layer.token }))
    }))
  )

  const legend = computed(() =>
    LAYERS.map((layer) => ({
      ...layer,
      ...(card.value.legend?.[layer.key] || {})
    })).reverse()
  )
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.vacation.statusTitle')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="px-4 pt-2 pb-3 gap-2.5"
    @action="$emit('detail')"
  >
    <FigColumns :items="items" :height="120" :show-percent="false" />

    <div class="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 pt-1">
      <div v-for="layer in legend" :key="layer.key" class="flex items-center gap-1.5">
        <span
          class="h-2.5 w-2.5 shrink-0 rounded-full"
          :style="{ backgroundColor: `var(${layer.token})` }"
        ></span>
        <p class="text-[12px] leading-4 whitespace-nowrap text-fig-text-secondary">
          {{ $t(`dashboardPage.vacationState.${layer.key}`) }} · {{ toCount(layer.value) }} ·
          {{ toRoundPercent(layer.percent) }}
        </p>
        <FigTrend :metric="layer" unit="percent" :label-key="null" />
      </div>
    </div>
  </FigPanel>
</template>
