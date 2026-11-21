<script setup>
  // «Reja bo'yicha davomat» — umumiy `DonutCard` qolipida (pie qatoridagi uchta kartadan biri).
  // Grafik bo'yicha shu kun kelishi kerak bo'lganlar = kelgan + kelmagan + sababli (yoki ta'tilda).
  import DonutCard from './DonutCard.vue'
  import { PALETTE, TINT } from './palette.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { CalendarCheckmark20Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const items = computed(() => {
    const plan = store.attendance?.plan || {}
    return [
      {
        label: 'turnStileDashboard.plan.came',
        info: 'turnStileDashboard.plan.cameInfo',
        count: plan.came || 0,
        token: PALETTE.main,
        previewType: 'att_plan_came'
      },
      {
        label: 'turnStileDashboard.plan.absent',
        info: 'turnStileDashboard.plan.absentInfo',
        count: plan.absent || 0,
        token: PALETTE.bad,
        previewType: 'att_plan_absent'
      },
      {
        label: 'turnStileDashboard.plan.excused',
        info: 'turnStileDashboard.plan.excusedInfo',
        count: plan.excused || 0,
        token: PALETTE.warn,
        previewType: 'att_plan_excused'
      }
    ]
  })
</script>

<template>
  <DonutCard
    :icon="CalendarCheckmark20Regular"
    :tint="TINT.main"
    :title="$t('turnStileDashboard.plan.title')"
    :subtitle="$t('turnStileDashboard.plan.expected')"
    :subtitle-hint="$t('turnStileDashboard.plan.expectedInfo')"
    :loading="store.mainChartLoading"
    :items="items"
    :center-label="t('turnStileDashboard.plan.expected')"
    @on-preview="emits('onPreview', $event)"
  />
</template>
