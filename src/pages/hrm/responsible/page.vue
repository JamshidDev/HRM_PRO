<script setup>
  import { UITabbedPage } from '@/components/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import ConfirmationPage from '@/pages/hrm/confirmation/ConfirmationPage.vue'
  import OrganizationLeaderPage from '@/pages/hrm/organizationLeader/organizationLeaderPage.vue'
  import TimesheetDepartmentPage from '@/pages/hrm/timesheetDepartment/TimesheetDepartmentPage.vue'
  import i18n from '@/i18n/index.js'

  const accStore = useAccountStore()
  const { t } = i18n.global

  // Har bob o'z ruxsatiga bog'liq — ruxsat yo'q bo'lsa bob umuman chizilmaydi.
  const tabs = computed(() =>
    [
      accStore.canView(accStore.pn.hrConfirmationsRead)
        ? { id: 'confirmation', name: t('confirmationPage.name'), component: ConfirmationPage }
        : null,
      accStore.canView(accStore.pn.hrLeadersRead)
        ? { id: 'leader', name: t('organizationLeaderPage.name'), component: OrganizationLeaderPage }
        : null,
      accStore.canView(accStore.pn.hrTableWorkersRead)
        ? {
            id: 'timesheet_department',
            name: t('timesheetWorkerPage.name'),
            component: TimesheetDepartmentPage
          }
        : null
    ].filter(Boolean)
  )
</script>

<template>
  <UITabbedPage :tabs="tabs" />
</template>
