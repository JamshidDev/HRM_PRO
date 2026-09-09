<script setup>
  import { UITabbedPage } from '@/components/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import VacationPage from '@/pages/hrm/vacation/page.vue'
  import VacationSchedulePage from '@/pages/hrm/vacationSchedule/page.vue'
  import BusinessTripPage from '@/pages/hrm/businessTrip/BusinessTripPage.vue'
  import PunishmentPage from '@/pages/hrm/punishment/PunishmentPage.vue'
  import IncentivePage from '@/pages/hrm/incentive/IncentivePage.vue'
  import i18n from '@/i18n/index.js'

  const accStore = useAccountStore()
  const { t } = i18n.global

  // Har bob o'z ruxsatiga bog'liq — ruxsat yo'q bo'lsa bob umuman chizilmaydi.
  const tabs = computed(() =>
    [
      accStore.canView(accStore.pn.hrVacationsRead)
        ? { id: 'vacation', name: t('vacationPage.name'), component: VacationPage }
        : null,
      accStore.canView(accStore.pn.hrVacationScheduleRead)
        ? { id: 'schedule', name: t('vacationSchedule.name'), component: VacationSchedulePage }
        : null,
      accStore.canView(accStore.pn.hrBusinessTripRead)
        ? { id: 'business_trip', name: t('businessTrip.name'), component: BusinessTripPage }
        : null,
      accStore.canView(accStore.pn.hrPunishmentRead)
        ? { id: 'punishment', name: t('punishment.name'), component: PunishmentPage }
        : null,
      accStore.canView(accStore.pn.hrIncentivesRead)
        ? { id: 'incentive', name: t('incentive.name'), component: IncentivePage }
        : null
    ].filter(Boolean)
  )
</script>

<template>
  <UITabbedPage :tabs="tabs" />
</template>
