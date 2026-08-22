<script setup>
  /**
   * Figma v3 · Tab 2 "Shtat va fakt — bo'linma kesimida" (node 2959:59116).
   *
   * Har bir bo'linma uchun bitta "bullet" qatori: rangli bar — fakt, qora
   * vertikal chiziq — shtat rejasi. Pastda maketdagi izoh qatori turadi.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigBullet from '../fig/FigBullet.vue'
  import { useDashboardStore } from '@/store/modules/index.js'

  defineEmits(['detail'])

  const store = useDashboardStore()

  const card = computed(() => store.movement.staff_vs_actual || {})
  const isMock = computed(() => store.isMock('movement', 'staff_vs_actual'))

  const items = computed(() => card.value.items || [])

  /** Barcha qatorlar bitta masshtabda: eng katta reja/fakt qiymati. */
  const maxValue = computed(() =>
    Math.max(...items.value.flatMap((item) => [item.plan ?? 0, item.actual ?? 0]), 0)
  )
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.staffFact.title')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="px-4 pt-1 pb-2"
    @action="$emit('detail')"
  >
    <FigBullet
      v-for="item in items"
      :key="item.organization_id"
      :label="item.name"
      :actual="item.actual"
      :plan="item.plan"
      :percent="item.percent"
      :metric="item"
      :max-value="maxValue"
    />

    <p class="mt-auto pt-1.5 text-[12px] leading-4 text-fig-text-tertiary">
      {{ $t('dashboardPage.staffFact.hint') }}
    </p>
  </FigPanel>
</template>
