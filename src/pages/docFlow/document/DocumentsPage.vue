<script setup>
  import { UITabbedPage } from '@/components/index.js'
  import { useAccountStore, useSocketStore } from '@/store/modules/index.js'
  import ContractPage from './contract/ContractPage.vue'
  import CommandPage from './command/page.vue'
  import AdContractPage from './adContract/page.vue'
  import ApplicationPage from './application/page.vue'
  import TimesheetPage from '@/pages/hrm/timesheet/TimesheetList.vue'
  import i18n from '@/i18n/index.js'

  const accStore = useAccountStore()
  const socketStore = useSocketStore()
  const { t } = i18n.global

  // Imzolanmagan hujjatlar soni — sidebar badge'i bilan bir xil manba.
  const badgeOf = (field) => socketStore.getCount('hr', field) || undefined

  const tabs = computed(() =>
    [
      accStore.canView(accStore.pn.hrContractsRead)
        ? {
            id: 'contract',
            name: t('documentPage.tabs.contract'),
            badge: badgeOf('contracts'),
            component: ContractPage
          }
        : null,
      accStore.canView(accStore.pn.hrCommandsRead)
        ? {
            id: 'command',
            name: t('documentPage.tabs.command'),
            badge: badgeOf('commands'),
            component: CommandPage
          }
        : null,
      accStore.canView(accStore.pn.hrContractAdditionalRead)
        ? {
            id: 'ad_contract',
            name: t('documentPage.tabs.adContract'),
            badge: badgeOf('contract-additional'),
            component: AdContractPage
          }
        : null,
      accStore.canView(accStore.pn.hrWorkerApplicationsRead)
        ? {
            id: 'application',
            name: t('applicationPage.name'),
            badge: badgeOf('worker-applications'),
            component: ApplicationPage
          }
        : null,
      accStore.canView(accStore.pn.hrTableRead)
        ? { id: 'timesheet', name: t('timesheetPage.name'), component: TimesheetPage }
        : null
    ].filter(Boolean)
  )
</script>

<template>
  <UITabbedPage :tabs="tabs" />
</template>
