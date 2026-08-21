// HR dashboard "Audit" tab — data-quality ko'rsatkichlari (tab qatori).
// type — backend `dashboard-audit-preview?type=` bilan bir xil (1..5).
// countKey — `dashboard-audit-personal` javobidagi son maydoni.
export const AuditType = {
  RELATIVES_SHORTAGE: 1,
  RELATIVES_WITHOUT_JSHSHIR: 2,
  NAME_ERRORS: 3,
  JSHSHIR_ERRORS: 4,
  POSITION_CERTIFICATE_MISSING: 5
}

// Tartib dizayndagi tablar ketma-ketligiga mos; birinchisi sukut bo'yicha tanlanadi.
export const auditCards = [
  {
    type: AuditType.JSHSHIR_ERRORS,
    title: 'dashboardPage.audit.jshshirErrors',
    countKey: 'jshshir_errors'
  },
  {
    type: AuditType.NAME_ERRORS,
    title: 'dashboardPage.audit.nameErrors',
    countKey: 'name_errors'
  },
  {
    type: AuditType.RELATIVES_SHORTAGE,
    title: 'dashboardPage.audit.relativesShortage',
    countKey: 'relatives_shortage'
  },
  // «Yaqin qarindoshlari PINFL bo'yicha» audit OLIB TASHLANDI — qarindoshlarda
  // endi PINFL kiritilmaydi (input/jadval olib tashlangan), audit ma'nosini yo'qotdi.
  {
    type: AuditType.POSITION_CERTIFICATE_MISSING,
    title: 'dashboardPage.audit.positionCertificateMissing',
    countKey: 'position_certificate_missing'
  }
]
