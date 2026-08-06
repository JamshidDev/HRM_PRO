// HR dashboard "Audit" tab — data-quality kartalari.
// type — backend `dashboard-audit-preview?type=` bilan bir xil (1..5).
// countKey — `dashboard-audit-personal` javobidagi son maydoni.
export const AuditType = {
  RELATIVES_SHORTAGE: 1,
  RELATIVES_WITHOUT_JSHSHIR: 2,
  NAME_ERRORS: 3,
  JSHSHIR_ERRORS: 4,
  POSITION_CERTIFICATE_MISSING: 5
}

export const auditCards = [
  {
    type: AuditType.RELATIVES_SHORTAGE,
    title: 'dashboardPage.audit.relativesShortage',
    countKey: 'relatives_shortage'
  },
  {
    type: AuditType.RELATIVES_WITHOUT_JSHSHIR,
    title: 'dashboardPage.audit.relativesWithoutJshshir',
    countKey: 'relatives_without_jshshir'
  },
  {
    type: AuditType.NAME_ERRORS,
    title: 'dashboardPage.audit.nameErrors',
    countKey: 'name_errors'
  },
  {
    type: AuditType.JSHSHIR_ERRORS,
    title: 'dashboardPage.audit.jshshirErrors',
    countKey: 'jshshir_errors'
  },
  {
    type: AuditType.POSITION_CERTIFICATE_MISSING,
    title: 'dashboardPage.audit.positionCertificateMissing',
    countKey: 'position_certificate_missing'
  }
]
