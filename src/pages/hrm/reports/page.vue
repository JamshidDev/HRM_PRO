<script setup>
  import { UITabbedPage } from '@/components/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import ReportPage from '@/pages/hrm/report/ReportPage.vue'
  import PensionerPage from '@/pages/hrm/pensioner/page.vue'
  import SpecialReportPage from '@/pages/hrm/specialReport/SpecialReportPage.vue'
  import StructureReportPage from '@/pages/hrm/structureReport/page.vue'
  import ArchivePage from '@/pages/hrm/archive/page.vue'
  import WorkerCertificatePage from '@/pages/hrm/workerCertificate/page.vue'
  import DocumentArchivePage from '@/pages/hrm/documentArchive/DocumentArchivePage.vue'
  import i18n from '@/i18n/index.js'

  const accStore = useAccountStore()
  const { t } = i18n.global

  // Har bob o'z ruxsatiga bog'liq — ruxsat yo'q bo'lsa bob umuman chizilmaydi.
  const tabs = computed(() =>
    [
      accStore.canView(accStore.pn.hrReportRead)
        ? { id: 'plan_fact', name: t('report.name'), component: ReportPage }
        : null,
      accStore.canView(accStore.pn.hrReportRead)
        ? { id: 'pensioner', name: t('pensioner.name'), component: PensionerPage }
        : null,
      accStore.canView(accStore.pn.hrReportExport)
        ? { id: 'special', name: t('reports.tabs.special'), component: SpecialReportPage }
        : null,
      accStore.canView(accStore.pn.hrMonthlyReport)
        ? { id: 'structure', name: t('structureReport.name'), component: StructureReportPage }
        : null,
      accStore.canView(accStore.pn.hrArchiveRead)
        ? { id: 'archive', name: t('archive.name'), component: ArchivePage }
        : null,
      accStore.canView(accStore.pn.hrCertificatesRead)
        ? {
            id: 'certificate',
            name: t('workerCertificatePage.name'),
            component: WorkerCertificatePage
          }
        : null,
      accStore.canView(accStore.pn.hrDocumentsRead)
        ? {
            id: 'document_archive',
            name: t('documentArchive.name'),
            component: DocumentArchivePage
          }
        : null
    ].filter(Boolean)
  )
</script>

<template>
  <UITabbedPage :tabs="tabs" />
</template>
