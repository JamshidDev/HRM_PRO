<script setup>
  // «Kelmaslik sabablari» (ilgari «Imtiyozli xodimlar» — dam olish kuni imtiyoz emas) — umumiy `DonutCard` qolipida: kelmasa ham sababi bor xodimlar
  // (ta'til, grafik bo'yicha dam olish kuni, sababli). Ranglar shu karta uchun: ta'til — binafsha,
  // dam olish — ko'k, sababli — amber («Reja bo'yicha davomat» dagi «Sababli» bilan bir xil).
  import DonutCard from './DonutCard.vue'
  import { PALETTE } from './palette.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { CalendarPerson20Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const items = computed(() => [
    {
      label: 'turnStileDashboard.attendance.vacation',
      info: 'turnStileDashboard.attendance.vacationInfo',
      count: store.attendance?.vacation || 0,
      token: '--fig-icon-purple',
      previewType: 'att_vacation'
    },
    {
      label: 'turnStileDashboard.attendance.day_off',
      info: 'turnStileDashboard.attendance.day_offInfo',
      count: store.attendance?.day_off || 0,
      token: PALETTE.main,
      previewType: 'att_day_off'
    },
    {
      label: 'turnStileDashboard.attendance.excused',
      info: 'turnStileDashboard.attendance.excusedInfo',
      count: store.attendance?.excused || 0,
      token: PALETTE.warn,
      previewType: 'att_excused'
    }
  ])
</script>

<template>
  <DonutCard
    :icon="CalendarPerson20Regular"
    tint="amber"
    :title="$t('turnStileDashboard.kpi.notComingReasons')"
    :subtitle="$t('turnStileDashboard.cards.privilegeSubtitle')"
    :loading="store.grandLoading"
    :items="items"
    :center-label="t('turnStileDashboard.month.total')"
    @on-preview="emits('onPreview', $event)"
  />
</template>
