import {
  Certificate24Regular,
  ContactCard24Regular,
  PeopleTeam24Regular,
  PersonNote24Regular,
  PersonQuestionMark24Regular
} from '@vicons/fluent'

// HR dashboard "Audit" tab — data-quality kartalari.
// type — backend `dashboard-audit-preview?type=` bilan bir xil (1..5).
// countKey — `dashboard-audit-personal` javobidagi son maydoni.
// icon / color — MOCK: dizayn bo'yicha vaqtinchalik tanlangan, keyin almashtiriladi.
export const AuditType = {
  RELATIVES_SHORTAGE: 1,
  RELATIVES_WITHOUT_JSHSHIR: 2,
  NAME_ERRORS: 3,
  JSHSHIR_ERRORS: 4,
  POSITION_CERTIFICATE_MISSING: 5
}

// Tartib dizayndagi kartalar ketma-ketligiga mos.
export const auditCards = [
  {
    type: AuditType.JSHSHIR_ERRORS,
    title: 'dashboardPage.audit.jshshirErrors',
    countKey: 'jshshir_errors',
    icon: ContactCard24Regular,
    color: 'danger'
  },
  {
    type: AuditType.NAME_ERRORS,
    title: 'dashboardPage.audit.nameErrors',
    countKey: 'name_errors',
    icon: PersonNote24Regular,
    color: 'danger'
  },
  {
    type: AuditType.RELATIVES_SHORTAGE,
    title: 'dashboardPage.audit.relativesShortage',
    countKey: 'relatives_shortage',
    icon: PeopleTeam24Regular,
    color: 'warning'
  },
  {
    type: AuditType.RELATIVES_WITHOUT_JSHSHIR,
    title: 'dashboardPage.audit.relativesWithoutJshshir',
    countKey: 'relatives_without_jshshir',
    icon: PersonQuestionMark24Regular,
    color: 'warning'
  },
  {
    type: AuditType.POSITION_CERTIFICATE_MISSING,
    title: 'dashboardPage.audit.positionCertificateMissing',
    countKey: 'position_certificate_missing',
    icon: Certificate24Regular,
    color: 'warning'
  }
]

// TODO(backend): quyidagi qiymatlar `/v1/hr/dashboard-audit-personal` javobida yo'q.
// Endpoint kengaytirilganda shu obyekt o'chirilib, ma'lumot store'dan o'qiladi.
// UIUserGroup `{ photo, fullName }` shaklini kutadi; photo=null bo'lganda
// useAppSetting.noAvailableImage ('/no-picture.png') fallback rasmi chiqadi.
export const auditCardMock = {
  lastCheckedAt: '24.06.2026',
  avatars: [
    { photo: null, fullName: '—' },
    { photo: null, fullName: '—' },
    { photo: null, fullName: '—' }
  ],
  avatarsMore: 12
}
