// AVTO-GENERATSIYA (navigations.js + AppPermissions.js dan). Rol formasi guruhlash.
// Modul (tab) -> sub-menyu (card) -> prefiks. label = menyu i18n kaliti ($t bilan).
// Har guruh <prefix>-read/-write/-delete avtomatik; bo'lmasa bazaviy "Ruxsat" switch.

export const ACTION_LABELS = { read: "Ko'rish", write: 'Yaratish / Tahrirlash', delete: "O'chirish" }
export const ACTION_ORDER = ['read', 'write', 'delete']

// Backend @Permission bilan HAQIQATAN enforce qilinadigan sluglar. write/delete
// switch faqat shu to'plamda bo'lsa ko'rsatiladi (mutatsiya real API talab qiladi).
export const ENFORCED = new Set([
  'activity-logs-read', 'admin', 'authentication-logs-read', 'chat', 'chat-news-delete', 'cities-delete', 'cities-write',
  'confirmation-documents-delete', 'confirmation-worker-applications-delete', 'countries-delete', 'countries-write', 'department-location-delete', 'department-location-read',
  'department-location-write', 'deploy-read', 'deploy-write', 'document-view-exam-results', 'economist', 'economist-dashboard-read',
  'economist-pension-payments-delete', 'economist-pension-payments-read', 'economist-pension-payments-write', 'economist-staffing-approve-delete', 'economist-staffing-approve-read', 'economist-staffing-approve-write',
  'economist-statements-delete', 'economist-statements-read', 'economist-statements-write', 'economist-tax-five-delete', 'economist-tax-five-read', 'economist-tax-five-write',
  'economist-tax-four-delete', 'economist-tax-four-read', 'economist-tax-four-write', 'economist-uploads-read', 'economist-uploads-write', 'economist-worker-categories-delete',
  'economist-worker-categories-read', 'economist-worker-categories-write', 'exam-categories-delete', 'exam-categories-read', 'exam-categories-write', 'exam-exams-delete',
  'exam-exams-read', 'exam-exams-write', 'exam-topics-delete', 'exam-topics-read', 'exam-topics-write', 'filter-search-workers',
  'holiday-greetings-delete', 'holiday-greetings-read', 'holiday-greetings-write', 'holidays-delete', 'holidays-write', 'hr',
  'hr-business-trip-read', 'hr-check-worker', 'hr-commands-delete', 'hr-commands-read', 'hr-commands-write', 'hr-confirmations-delete',
  'hr-confirmations-read', 'hr-confirmations-write', 'hr-contract-additional-delete', 'hr-contract-additional-read', 'hr-contract-additional-write', 'hr-contracts-delete',
  'hr-kpi-read', 'hr-certificates-read', 'hr-contracts-read', 'hr-contracts-write', 'hr-dashboard', 'hr-dashboard-audit', 'hr-dashboard-read', 'hr-departments-delete', 'hr-departments-read',
  'hr-departments-write', 'hr-discips-read', 'hr-documents-delete', 'hr-documents-read', 'hr-documents-write', 'hr-edu-plans-read',
  'hr-edu-plans-write', 'hr-incentives-read', 'hr-incentives-write', 'hr-tasks-read', 'hr-tasks-write', 'hr-tasks-delete', 'hr-language-certificates-delete', 'hr-language-certificates-read', 'hr-language-certificates-write',
  'hr-leaders-delete', 'hr-leaders-read', 'hr-leaders-write', 'hr-med-delete', 'hr-med-read', 'hr-med-write',
  'hr-monthly-report-delete', 'hr-organization-phones-delete', 'hr-organization-phones-read', 'hr-organization-phones-write', 'hr-pensioners-delete', 'hr-pensioners-read',
  'hr-pensioners-write', 'hr-polyclinics-delete', 'hr-polyclinics-read', 'hr-polyclinics-write', 'hr-positions-delete', 'hr-positions-read',
  'hr-positions-write', 'hr-public-vacancy-delete', 'hr-public-vacancy-read', 'hr-public-vacancy-write', 'hr-report', 'hr-report-delete',
  'hr-report-export-delete', 'hr-table-delete', 'hr-table-read', 'hr-table-write', 'hr-users-active-role', 'hr-users-attach-role',
  'hr-users-detach-role', 'hr-users-password', 'hr-users-read', 'hr-users-update', 'hr-vacation-schedule-delete', 'hr-vacation-schedule-read',
  'hr-vacation-schedule-write', 'hr-vacations-read', 'hr-worker-applications-read', 'hr-worker-applications-write', 'hr-workers-delete', 'hr-workers-read',
  'hr-workers-write', 'hr-zoom-read', 'instructions', 'instructions-delete', 'instructions-write', 'integration',
  'integration-clients-delete', 'integration-clients-read', 'integration-clients-write', 'languages-delete', 'languages-write', 'learning-centers-delete',
  'learning-centers-write', 'lms-certificate-delete', 'lms-certificate-read', 'lms-certificate-write', 'lms-direction-delete', 'lms-direction-read',
  'lms-direction-write', 'lms-edu-plan-delete', 'lms-edu-plan-read', 'lms-edu-plan-write', 'lms-lessons-delete', 'lms-lessons-read',
  'lms-lessons-write', 'lms-specialization-delete', 'lms-specialization-read', 'lms-specialization-write', 'lms-subjects-delete', 'lms-subjects-read',
  'lms-subjects-write', 'lms-teachers-delete', 'lms-teachers-read', 'lms-teachers-write', 'log-viewer-read', 'mobile-stories-delete',
  'mobile-users-read', 'nationalities-delete', 'nationalities-write', 'organization-services-write', 'organizations-delete', 'organizations-write',
  'permissions-delete', 'permissions-read', 'permissions-write', 'positions-delete', 'positions-write', 'quotes-delete',
  'quotes-write', 'regions-delete', 'regions-write', 'roles-delete', 'roles-read', 'roles-write',
  'schedules-delete', 'schedules-write', 'specialities-delete', 'specialities-write', 'telegram-read', 'telegram-write',
  'turnstile-absent-workers-export', 'turnstile-approve-delete', 'turnstile-approve-read', 'turnstile-approve-write', 'turnstile-building-delete', 'turnstile-building-read',
  'turnstile-devices-export', 'turnstile-devices-stat-export', 'turnstile-sheets-timesheet-export', 'turnstile-schedule', 'turnstile-schedule-read', 'turnstile-schedule-write', 'turnstile-dashboard-export', 'turnstile-hik-central-events-read', 'turnstile-hik-central-job-write', 'turnstile-hik-central-sync', 'turnstile-hik-central-sync-read', 'turnstile-building-write', 'turnstile-devices-delete', 'turnstile-devices-read', 'turnstile-devices-write', 'turnstile-hik-central-tg-user-delete', 'turnstile-hik-central-tg-user-read',
  'turnstile-hik-central-tg-user-write', 'turnstile-hik-central-workers-delete', 'turnstile-hik-central-workers-read', 'turnstile-hik-central-workers-write', 'turnstile-sheets-delete', 'turnstile-sheets-groups-delete',
  'turnstile-sheets-groups-read', 'turnstile-sheets-groups-write', 'turnstile-sheets-read', 'turnstile-sheets-workers-delete', 'turnstile-sheets-workers-read', 'turnstile-sheets-workers-write',
  'turnstile-sheets-write', 'turnstile-terminal-delete', 'turnstile-terminal-read', 'turnstile-terminal-write', 'universities-delete', 'universities-write',
  'users-delete', 'users-read', 'users-write', 'vacancy-approve-delete', 'work-day-delete', 'work-day-write',
  // Audit 2026-08-13 — admin sahifalarini `admin`dan aniq read/write ruxsatga ko'chirish:
  'vacancy-approve-read', 'vacancy-approve-write', 'worker-reports-read',
  // Audit 2026-08-12 — frontend gate qiladigan, lekin rol formasida yashirin qolgan
  // write toggle'lar (oddiy kartada ENFORCED'da bo'lmagani uchun ko'rinmasdi):
  'turnstile-worker-image-write', 'hr-vacations-write', 'hr-business-trip-write',
  'hr-report-write', 'lms-worker-write', 'hospital-pensioner-write', 'document-examples-write',
  // Audit 2026-08-12 — granular sahifa amallari (alohida toggle):
  'turnstile-access-levels-sync', 'turnstile-sheets-copy', 'turnstile-sheets-turnstile',
  'turnstile-sheets-replace', 'turnstile-sheets-groups-finish', 'turnstile-schedule-check',
])

// AVTO-GENERATSIYA: backend @Permission (enforce qilinadigan) + frontend AppPermissions
// (haqiqatan ishlatilgan) sluglar birlashmasi. Forma faqat SHU sluglarga switch
// ko'rsatadi — DB'da bor-u hech qayerda ishlatilmaydigan (spurious) sluglar yashiriladi.
export const MEANINGFUL = new Set([
  'activity-logs', 'activity-logs-read', 'admin', 'ai', 'authentication-logs-read', 'chat-news-delete',
  'chat', 'chat-notification', 'chat-telegram-messages', 'cities', 'cities-delete', 'cities-read', 'cities-write',
  'confirmation', 'confirmation-commands', 'confirmation-contract-additional', 'confirmation-contracts', 'confirmation-documents-delete', 'confirmation-lms-certificate',
  'confirmation-lms-certificate-read', 'confirmation-staffing-approval', 'confirmation-table', 'confirmation-worker-applications', 'confirmation-worker-applications-delete', 'countries',
  'countries-delete', 'countries-read', 'countries-write', 'department-location', 'department-location-delete', 'department-location-read',
  'department-location-write', 'deploy-read', 'deploy-write', 'document-examples', 'document-examples-read', 'document-examples-write',
  'document-view-exam-results', 'economist', 'economist-dashboard', 'economist-dashboard-read', 'economist-pension-payments', 'economist-pension-payments-delete',
  'economist-pension-payments-read', 'economist-pension-payments-write', 'economist-staffing-approve', 'economist-staffing-approve-delete', 'economist-staffing-approve-read', 'economist-staffing-approve-write',
  'economist-statements', 'economist-statements-code', 'economist-statements-delete', 'economist-statements-read', 'economist-statements-write', 'economist-tax-five',
  'economist-tax-five-delete', 'economist-tax-five-read', 'economist-tax-five-write', 'economist-tax-four', 'economist-tax-four-delete', 'economist-tax-four-read',
  'economist-tax-four-write', 'economist-uploads', 'economist-uploads-confirm', 'economist-uploads-read', 'economist-uploads-status', 'economist-uploads-write',
  'economist-worker-categories', 'economist-worker-categories-delete', 'economist-worker-categories-read', 'economist-worker-categories-write', 'educations-structure-menu', 'exam',
  'exam-categories', 'exam-categories-delete', 'exam-categories-read', 'exam-categories-write', 'exam-exams', 'exam-exams-delete',
  'exam-exams-read', 'exam-exams-write', 'exam-results', 'exam-results-read', 'exam-topics', 'exam-topics-delete',
  'exam-topics-read', 'exam-topics-write', 'export-workers-zip', 'extra', 'filter-search-workers', 'holiday-greetings-delete',
  'holiday-greetings-read', 'holiday-greetings-write', 'holidays', 'holidays-delete', 'holidays-read', 'holidays-write',
  'hospital', 'hospital-expired', 'hospital-pensioner', 'hospital-pensioner-read', 'hospital-pensioner-write', 'hospital-ticket',
  'hr', 'hr-business-trip', 'hr-business-trip-read', 'hr-business-trip-write', 'hr-check-worker', 'hr-commands',
  'hr-commands-blank', 'hr-commands-delete', 'hr-commands-read', 'hr-commands-write', 'hr-confirmations', 'hr-confirmations-delete',
  'hr-confirmations-read', 'hr-confirmations-write', 'hr-contract-additional', 'hr-contract-additional-delete', 'hr-contract-additional-read', 'hr-contract-additional-write',
  'hr-kpi', 'hr-kpi-read', 'hr-certificates-read', 'hr-contracts', 'hr-contracts-delete', 'hr-contracts-read', 'hr-contracts-write', 'hr-dashboard', 'hr-dashboard-audit', 'hr-dashboard-read',
  'hr-departments', 'hr-departments-delete', 'hr-departments-read', 'hr-departments-write', 'hr-discips', 'hr-discips-read',
  'hr-documents', 'hr-documents-delete', 'hr-documents-read', 'hr-documents-write', 'hr-edu-plans-read', 'hr-edu-plans-write',
  'hr-export', 'hr-incentives', 'hr-incentives-read', 'hr-incentives-write', 'hr-tasks', 'hr-tasks-read', 'hr-tasks-write', 'hr-tasks-delete', 'hr-jobs', 'hr-jobs-read',
  'hr-language-certificates-delete', 'hr-language-certificates-read', 'hr-language-certificates-write', 'hr-leaders', 'hr-leaders-delete', 'hr-leaders-read',
  'hr-leaders-write', 'hr-med', 'hr-med-delete', 'hr-med-read', 'hr-med-write', 'hr-monthly-report',
  'hr-monthly-report-delete', 'hr-organization-phones-delete', 'hr-organization-phones-read', 'hr-organization-phones-write', 'hr-pensioners-delete', 'hr-pensioners-read',
  'hr-pensioners-write', 'hr-polyclinics-delete', 'hr-polyclinics-read', 'hr-polyclinics-write', 'hr-positions', 'hr-positions-delete',
  'hr-positions-read', 'hr-positions-write', 'hr-public-vacancy', 'hr-public-vacancy-delete', 'hr-public-vacancy-read', 'hr-public-vacancy-write',
  'hr-report', 'hr-report-delete', 'hr-report-export', 'hr-report-export-delete', 'hr-report-management-write', 'hr-report-read',
  'hr-report-write', 'hr-table', 'hr-table-delete', 'hr-table-read', 'hr-table-workers', 'hr-table-workers-read',
  'hr-table-workers-write', 'hr-table-write', 'hr-users', 'hr-users-active-role', 'hr-users-attach-role', 'hr-users-detach-role',
  'hr-users-password', 'hr-users-read', 'hr-users-update', 'hr-vacation-schedule-delete', 'hr-vacation-schedule-read', 'hr-vacation-schedule-write',
  'hr-vacations', 'hr-vacations-read', 'hr-vacations-write', 'hr-worker-applications', 'hr-worker-applications-read', 'hr-worker-applications-write',
  'hr-workers', 'hr-workers-delete', 'hr-workers-read', 'hr-workers-write', 'hr-zoom-read', 'instructions',
  'instructions-delete', 'instructions-read', 'instructions-write', 'integration', 'integration-clients-delete', 'integration-clients-read',
  'integration-clients-write', 'languages-delete', 'languages-read', 'languages-write', 'learning-centers', 'learning-centers-delete',
  'learning-centers-read', 'learning-centers-write', 'lms', 'lms-certificate', 'lms-certificate-delete', 'lms-certificate-read',
  'lms-certificate-write', 'lms-direction', 'lms-direction-delete', 'lms-direction-read', 'lms-direction-write', 'lms-edu-plan',
  'lms-edu-plan-delete', 'lms-edu-plan-read', 'lms-edu-plan-write', 'lms-groups-read', 'lms-groups-write', 'lms-lessons',
  'lms-lessons-delete', 'lms-lessons-read', 'lms-lessons-write', 'lms-specialization', 'lms-specialization-delete', 'lms-specialization-read',
  'lms-specialization-write', 'lms-subjects', 'lms-subjects-delete', 'lms-subjects-read', 'lms-subjects-write', 'lms-teachers',
  'lms-teachers-delete', 'lms-teachers-read', 'lms-teachers-write', 'lms-worker', 'lms-worker-read', 'lms-worker-write',
  'log-viewer-read', 'mobile-stories-delete', 'mobile-users-read', 'nationalities', 'nationalities-delete', 'nationalities-read',
  'nationalities-write', 'organization-services-write', 'organizations', 'organizations-delete', 'organizations-read', 'organizations-write',
  'permissions', 'permissions-delete', 'permissions-read', 'permissions-write', 'positions', 'positions-delete',
  'positions-read', 'positions-write', 'quotes-delete', 'quotes-write', 'regions', 'regions-delete',
  'regions-read', 'regions-write', 'roles', 'roles-delete', 'roles-read', 'roles-write',
  'schedules', 'schedules-delete', 'schedules-read', 'schedules-write', 'specialities-delete', 'specialities-read',
  'specialities-write', 'telegram', 'telegram-read', 'telegram-write', 'turnstile', 'turnstile-absent-workers-export',
  'turnstile-access-levels', 'turnstile-access-levels-read', 'turnstile-access-levels-write', 'turnstile-approve', 'turnstile-approve-delete', 'turnstile-approve-read',
  'turnstile-approve-write', 'turnstile-building', 'turnstile-building-delete', 'turnstile-building-read', 'turnstile-building-write', 'turnstile-dashboard',
  'turnstile-devices-export', 'turnstile-devices-stat-export', 'turnstile-sheets-timesheet-export', 'turnstile-schedule', 'turnstile-schedule-read', 'turnstile-schedule-write', 'turnstile-dashboard-export', 'turnstile-hik-central-sync', 'turnstile-hik-central-sync-read', 'turnstile-dashboard-read', 'turnstile-devices', 'turnstile-devices-delete', 'turnstile-devices-read', 'turnstile-devices-write', 'turnstile-hc-invalid-user',
  'turnstile-hc-user-image-logs', 'turnstile-hcp-duration', 'turnstile-hcp-duration-read', 'turnstile-hik-central-events', 'turnstile-hik-central-events-read', 'turnstile-hik-central-job',
  'turnstile-hik-central-job-read', 'turnstile-hik-central-job-write', 'turnstile-hik-central-sync', 'turnstile-hik-central-sync-read', 'turnstile-hik-central-sync-write', 'turnstile-hik-central-tg-user',
  'turnstile-hik-central-tg-user-delete', 'turnstile-hik-central-tg-user-read', 'turnstile-hik-central-tg-user-write', 'turnstile-hik-central-workers', 'turnstile-hik-central-workers-delete', 'turnstile-hik-central-workers-read',
  'turnstile-hik-central-workers-write', 'turnstile-organization', 'turnstile-organization-access-levels', 'turnstile-organization-access-levels-read', 'turnstile-organization-access-levels-write', 'turnstile-organization-read',
  'turnstile-organization-write', 'turnstile-others', 'turnstile-sheets', 'turnstile-sheets-delete', 'turnstile-sheets-groups', 'turnstile-sheets-groups-delete',
  'turnstile-sheets-groups-read', 'turnstile-sheets-groups-write', 'turnstile-sheets-read', 'turnstile-sheets-workers', 'turnstile-sheets-workers-delete', 'turnstile-sheets-workers-read',
  'turnstile-sheets-workers-write', 'turnstile-sheets-write', 'turnstile-terminal', 'turnstile-terminal-delete', 'turnstile-terminal-read', 'turnstile-terminal-write',
  'turnstile-work-duration', 'turnstile-work-duration-read', 'turnstile-worker-image', 'turnstile-workers', 'turnstile-workers-read', 'turnstile-workers-write',
  'universities', 'universities-delete', 'universities-read', 'universities-write', 'useful', 'users',
  'users-delete', 'users-read', 'users-write', 'vacancy-approve-delete', 'work-day', 'work-day-delete',
  'work-day-read', 'work-day-write',
  // Audit 2026-08-13 — Tasdiqlash + Xodim hisobotlari aniq ruxsatlari:
  'vacancy-approve', 'vacancy-approve-read', 'vacancy-approve-write',
  'worker-reports', 'worker-reports-read',
])

export const PERMISSION_GROUPS = [
  {
    module: 'hr',
    label: 'navigation.hrm',
    groups: [
      { prefix: 'hr', label: 'userRole.form.moduleAccess' },
      {
        prefix: 'hr-dashboard',
        label: 'dashboardPage.name',
        actions: [
          { slug: 'hr-dashboard-read', label: "Ko'rish" },
          { slug: 'hr-dashboard-audit', label: 'Audit' },
        ],
      },
      { prefix: 'hr-workers', label: 'workerPage.name' },
      { prefix: 'hr-certificates', label: 'workerCertificatePage.name' },
      { prefix: 'hr-kpi', label: 'kpiPage.name' },
      { prefix: 'hr-departments', label: 'departmentPage.name' },
      { prefix: 'hr-positions', label: 'departmentPositionPage.name' },
      { prefix: 'hr-contracts', label: 'confirmation.name' },
      { prefix: 'hr-commands', label: 'documentPage.tabs.command' },
      { prefix: 'hr-contract-additional', label: 'documentPage.tabs.adContract' },
      { prefix: 'hr-worker-applications', label: 'applicationPage.name' },
      { prefix: 'hr-confirmations', label: 'confirmationPage.name' },
      { prefix: 'hr-vacations', label: 'vacationPage.name' },
      { prefix: 'hr-table-workers', label: 'timesheetWorkerPage.name' },
      { prefix: 'hr-table', label: 'timesheetPage.name' },
      { prefix: 'hr-med', label: 'medPage.name' },
      { prefix: 'hr-leaders', label: 'organizationLeaderPage.name' },
      { prefix: 'hr-business-trip', label: 'businessTrip.name' },
      { prefix: 'hr-documents', label: 'documentArchive.name' },
      { prefix: 'hr-vacation-schedule', label: 'vacationSchedule.name' },
      { prefix: 'hr-public-vacancy', label: 'vacancy.name' },
      { prefix: 'hr-discips', label: 'punishment.name' },
      { prefix: 'hr-incentives', label: 'incentive.name' },
      { prefix: 'hr-tasks', label: 'task.name' },
      { prefix: 'hr-report', label: 'report.name' },
      { prefix: 'lms-worker', label: 'lmsWorkerPage.name' },
      { prefix: 'hr-report-export', label: 'specialReport.name' },
      { prefix: 'hr-monthly-report', label: 'structureReport.name' },
      // Backend enforce qiladigan, lekin guruhi bo'lmagani uchun faqat "Boshqa"
      // ro'yxatida xom slug ko'rinishida turgan sohalar.
      { prefix: 'hr-pensioners', label: 'pensioner.name' },
      { prefix: 'hr-polyclinics', label: 'polyclinic.name' },
      { prefix: 'hr-language-certificates', label: 'languageCertificatePage.title' },
      { prefix: 'hr-organization-phones', label: 'content.phone' },
    ],
  },
  {
    module: 'confirmation',
    label: 'navigation.docFlow',
    groups: [
      { prefix: 'confirmation', label: 'userRole.form.moduleAccess' },
      { prefix: 'confirmation-contracts', label: 'confirmation.name' },
      { prefix: 'confirmation-commands', label: 'documentPage.tabs.command' },
      { prefix: 'confirmation-contract-additional', label: 'documentPage.tabs.adContract' },
      { prefix: 'confirmation-worker-applications', label: 'applicationPage.name' },
      { prefix: 'confirmation-table', label: 'timesheetPage.name' },
      { prefix: 'hr-vacation-schedule', label: 'vacationSchedule.name' },
      { prefix: 'confirmation-lms-certificate', label: 'lmsCertificate.name' },
      { prefix: 'confirmation-staffing-approval', label: 'staffingApproval.name' },
    ],
  },
  {
    module: 'exam',
    label: 'navigation.attestation',
    groups: [
      { prefix: 'exam', label: 'userRole.form.moduleAccess' },
      { prefix: 'exam-topics', label: 'topicPage.name' },
      { prefix: 'exam-categories', label: 'categoryPage.name' },
      { prefix: 'exam-exams', label: 'examPage.name' },
      { prefix: 'exam-results', label: 'examPage.result' },
    ],
  },
  {
    module: 'turnstile',
    label: 'navigation.turnstile',
    groups: [
      // Kartalar sidebar menyu tartibida (audit 2026-08-12). Har karta = bitta
      // faol menyu; ilgari o'chirilgan menyularning orphan kartalari olib tashlandi,
      // sub-amallar (sync/yuklash, HC server/Telegram) parent menyu ostiga guruhlandi.
      { prefix: 'turnstile', label: 'userRole.form.moduleAccess' },
      {
        prefix: 'turnstile-dashboard',
        label: 'turnStileDashboard.name',
        actions: [
          { slug: 'turnstile-dashboard-read', label: "Ko'rish" },
          { slug: 'turnstile-dashboard-export', label: 'Yuklash' }
        ]
      },
      {
        prefix: 'turnstile-access-levels',
        label: 'turnstile.accessLevelPage.name',
        actions: [
          { slug: 'turnstile-access-levels-read', label: "Ko'rish" },
          { slug: 'turnstile-access-levels-sync', label: 'Sinxronlash' },
          { slug: 'turnstile-access-levels-write', label: 'Tahrirlash' }
        ]
      },
      {
        prefix: 'turnstile-organization-access-levels',
        label: 'turnstile.orgAccessLevelsPage.name',
        actions: [
          { slug: 'turnstile-organization-access-levels-read', label: "Ko'rish" },
          { slug: 'turnstile-organization-access-levels-write', label: 'Biriktirish / Tahrirlash' }
        ]
      },
      { prefix: 'turnstile-hik-central-workers', label: 'turnstile.hcWorkersPage.name' },
      {
        prefix: 'turnstile-hik-central-events',
        label: 'hcEvent.name',
        actions: [
          { slug: 'turnstile-hik-central-events-read', label: "Ko'rish" },
          { slug: 'turnstile-absent-workers-export', label: 'Yuklab olish' }
        ]
      },
      {
        prefix: 'turnstile-worker-image',
        label: 'workerImage.name',
        actions: [
          { slug: 'turnstile-worker-image-read', label: "Ko'rish" },
          { slug: 'turnstile-worker-image-write', label: 'Tasdiqlash / Rad etish' }
        ]
      },
      {
        prefix: 'turnstile-devices',
        label: 'devices.name',
        actions: [
          { slug: 'turnstile-devices-read', label: "Ko'rish" },
          { slug: 'turnstile-devices-write', label: 'Yaratish / Tahrirlash' },
          { slug: 'turnstile-devices-delete', label: "O'chirish" },
          { slug: 'turnstile-devices-export', label: 'Yuklash' },
          { slug: 'turnstile-devices-stat-export', label: 'Hisobot yuklash' }
        ]
      },
      // Ish davomiyligi — menyu o'chirilgan, lekin ma'lumot dashboard (WorkAnalyticCard)
      // + standalone sahifada ishlatiladi; backend GET'lari `turnstile-work-duration-read`
      // bilan gate qilinadi (2026-08-13 audit) — grantable bo'lishi uchun guruh.
      {
        prefix: 'turnstile-work-duration',
        label: 'turnstile.workDurationPage.name',
        actions: [{ slug: 'turnstile-work-duration-read', label: "Ko'rish" }]
      },
      // «Qo'shimcha» menyusi — tab-konteyner. Menyu-kirish + har tab alohida karta
      // (o'z sahifa ruxsatlari bilan): Sinxronizatsiya loglari, HC server, Telegram.
      { prefix: 'turnstile-others', label: 'additionalPage.name' },
      { prefix: 'turnstile-hik-central-sync', label: 'hcEvent.syncTitle' },
      { prefix: 'turnstile-hik-central-job', label: 'hcServer.name' },
      { prefix: 'turnstile-hik-central-tg-user', label: 'notification.name' },
      {
        prefix: 'turnstile-sheets',
        label: 'schedule.name',
        actions: [
          { slug: 'turnstile-sheets-read', label: "Ko'rish" },
          { slug: 'turnstile-sheets-write', label: 'Yaratish / Tahrirlash' },
          { slug: 'turnstile-sheets-copy', label: 'Nusxalash' },
          { slug: 'turnstile-sheets-turnstile', label: 'Turniket boshqaruvi' },
          { slug: 'turnstile-sheets-replace', label: 'Xodim almashtirish' },
          { slug: 'turnstile-sheets-delete', label: "O'chirish" },
          { slug: 'turnstile-sheets-timesheet-export', label: 'Tabel yuklash' }
        ]
      },
      { prefix: 'turnstile-sheets-workers', label: 'shiftType.name' },
      {
        prefix: 'turnstile-sheets-groups',
        label: 'shiftType.groupName',
        actions: [
          { slug: 'turnstile-sheets-groups-read', label: "Ko'rish" },
          { slug: 'turnstile-sheets-groups-write', label: 'Yaratish / Tahrirlash' },
          { slug: 'turnstile-sheets-groups-finish', label: 'Yakunlash' },
          { slug: 'turnstile-sheets-groups-delete', label: "O'chirish" }
        ]
      },
      {
        prefix: 'turnstile-schedule',
        label: 'turnstileSchedule.name',
        actions: [
          { slug: 'turnstile-schedule-read', label: "Ko'rish" },
          { slug: 'turnstile-schedule-write', label: 'Qurilma biriktirish' },
          { slug: 'turnstile-schedule-check', label: 'Fakt tekshirish' }
        ]
      },
      { prefix: 'turnstile-approve', label: 'approve.name' },
    ],
  },
  {
    module: 'useful',
    label: 'navigation.general',
    groups: [{ prefix: 'useful', label: 'userRole.form.moduleAccess' }],
  },
  {
    module: 'lms',
    label: 'navigation.lms',
    groups: [
      { prefix: 'lms', label: 'userRole.form.moduleAccess' },
      { prefix: 'lms-direction', label: 'directionPage.name' },
      { prefix: 'lms-specialization', label: 'specializationPage.name' },
      { prefix: 'lms-subjects', label: 'subjectPage.name' },
      { prefix: 'lms-edu-plan', label: 'eduPlanPage.name' },
      { prefix: 'lms-teachers', label: 'teacherPage.name' },
      { prefix: 'lms-lessons', label: 'lessonPage.name' },
      { prefix: 'lms-certificate', label: 'lmsCertificate.name' },
    ],
  },
  {
    module: 'economist',
    label: 'navigation.economist',
    groups: [
      { prefix: 'economist', label: 'userRole.form.moduleAccess' },
      { prefix: 'economist-dashboard', label: 'accDashboard.name' },
      { prefix: 'economist-worker-categories', label: 'salaryCategory.name' },
      { prefix: 'economist-uploads', label: 'uploadReport.name' },
      { prefix: 'economist-statements', label: 'monthReport.name' },
      { prefix: 'economist-statements-code', label: 'salaryReport.name' },
      { prefix: 'economist-tax-four', label: 'taxFour.name' },
      { prefix: 'economist-tax-five', label: 'taxFive.name' },
      { prefix: 'economist-pension-payments', label: 'pensionPayment.name' },
      { prefix: 'hr-report', label: 'report.name' },
      { prefix: 'economist-staffing-approve', label: 'staffingApproval.name' },
    ],
  },
  {
    module: 'hospital',
    label: 'navigation.hospital',
    groups: [
      { prefix: 'hospital', label: 'userRole.form.moduleAccess' },
      { prefix: 'hospital-expired', label: 'expiredHealth.name' },
      { prefix: 'hospital-ticket', label: 'ticket.name' },
      { prefix: 'hospital-pensioner', label: 'pensioner.name' },
    ],
  },
  {
    module: 'chat',
    label: 'navigation.chat',
    groups: [
      { prefix: 'chat', label: 'userRole.form.moduleAccess' },
      { prefix: 'instructions', label: 'notificationPage.name' },
      { prefix: 'chat-telegram-messages', label: 'congratulation.name' },
    ],
  },
  {
    module: 'extra',
    label: 'navigation.extra',
    groups: [
      { prefix: 'extra', label: 'userRole.form.moduleAccess' },
      // Foydalanuvchilar — per-option ruxsatlar (read/write/delete emas, har amal alohida)
      {
        prefix: 'hr-users',
        label: 'workerRole.name',
        actions: [
          { slug: 'hr-users-read', label: "Ko'rish" },
          { slug: 'hr-users-attach-role', labelKey: 'workerRole.attachRole' },
          { slug: 'hr-users-detach-role', labelKey: 'workerRole.deleteRole' },
          { slug: 'hr-users-active-role', label: 'Faol rol' },
          { slug: 'hr-users-password', labelKey: 'workerRole.updatePassword' },
          { slug: 'hr-users-update', labelKey: 'workerRole.phoneNumber' },
        ],
      },
      { prefix: 'educations-structure-menu', label: 'educationDirectory.name' },
      { prefix: 'department-location', label: 'departmentLocationPage.name' },
    ],
  },
  {
    module: 'admin',
    label: 'navigation.admin',
    groups: [
      { prefix: 'admin', label: 'userRole.form.moduleAccess' },
      { prefix: 'users', label: 'userPage.name' },
      { prefix: 'roles', label: 'userRole.name' },
      { prefix: 'permissions', label: 'userPermission.name' },
      { prefix: 'countries', label: 'countryPage.name' },
      { prefix: 'regions', label: 'regionPage.name' },
      { prefix: 'cities', label: 'districtPage.name' },
      { prefix: 'nationalities', label: 'nationalityPage.name' },
      { prefix: 'positions', label: 'positionPage.name' },
      { prefix: 'schedules', label: 'schedulePage.name' },
      { prefix: 'work-day', label: 'workdayPage.name' },
      { prefix: 'organizations', label: 'organizationPage.name' },
      { prefix: 'activity-logs', label: 'actionLog.name' },
      { prefix: 'document-examples', label: 'documentSetting.name' },
      { prefix: 'holidays', label: 'holidayPage.name' },
      // "Boshqalar" sahifasi uch tabdan iborat va har biri o'z slug oilasiga ega —
      // ilgari faqat `universities` guruhi bor edi, qolgan ikkitasi "Boshqa"da qolardi.
      { prefix: 'universities', label: 'othersPage.tabs.university' },
      { prefix: 'specialities', label: 'othersPage.tabs.speciality' },
      { prefix: 'languages', label: 'othersPage.tabs.language' },
      { prefix: 'telegram', label: 'telegramPage.name' },
      { prefix: 'learning-centers', label: 'learningCenterPage.name' },
      { prefix: 'instructions', label: 'instructionPage.name' },
      { prefix: 'mobile-users', label: 'mobileUserPage.name' },
      { prefix: 'integration-clients', label: 'integrationClients.name' },
      { prefix: 'holiday-greetings', label: 'holidayGreetingPage.name' },
      { prefix: 'vacancy-approve', label: 'vacancyApprovePage.menuName' },
      { prefix: 'worker-reports', label: 'workerReport.name' },
    ],
  },
  {
    module: 'integration',
    label: 'Integration',
    guard: 'integration',
    groups: [
      { prefix: 'integration', label: 'userRole.form.moduleAccess' },
      { prefix: 'integration-enums', label: 'integrationPerm.enums' },
      { prefix: 'integration-dashboard', label: 'integrationPerm.dashboard' },
      { prefix: 'integration-structure', label: 'integrationPerm.structure' },
      { prefix: 'integration-leaders', label: 'integrationPerm.leaders' },
      { prefix: 'integration-departments', label: 'integrationPerm.departments' },
      { prefix: 'integration-departments-list', label: 'integrationPerm.departmentsList' },
      { prefix: 'integration-positions', label: 'integrationPerm.positions' },
      { prefix: 'integration-positions-list', label: 'integrationPerm.positionsList' },
      { prefix: 'integration-kpi', label: 'integrationPerm.kpi' },
      { prefix: 'integration-classifications', label: 'integrationPerm.classifications' },
      { prefix: 'integration-contracts', label: 'integrationPerm.contracts' },
      { prefix: 'integration-workers', label: 'integrationPerm.workers' },
      { prefix: 'integration-workers-dashboard', label: 'integrationPerm.workersDashboard' },
      { prefix: 'integration-workers-pins', label: 'integrationPerm.workersPins' },
      { prefix: 'integration-worker-pin', label: 'integrationPerm.workerPin' },
      { prefix: 'integration-worker-show', label: 'integrationPerm.workerShow' },
      { prefix: 'integration-worker-check', label: 'integrationPerm.workerCheck' },
      { prefix: 'integration-worker-events-month', label: 'integrationPerm.workerEventsMonth' },
      { prefix: 'integration-worker-events-day', label: 'integrationPerm.workerEventsDay' },
      { prefix: 'integration-turnstile-events', label: 'integrationPerm.turnstileEvents' },
      { prefix: 'integration-station-workers', label: 'integrationPerm.stationWorkers' },
      { prefix: 'integration-station-worker', label: 'integrationPerm.stationWorker' },
      { prefix: 'integration-station-resume', label: 'integrationPerm.stationResume' },
      { prefix: 'integration-station-stats', label: 'integrationPerm.stationStats' },
      { prefix: 'integration-meds', label: 'integrationPerm.meds' },
      { prefix: 'integration-worker-meds', label: 'integrationPerm.workerMeds' },
      { prefix: 'integration-worker-salary', label: 'integrationPerm.workerSalary' },
      { prefix: 'integration-worker-salary-months', label: 'integrationPerm.workerSalaryMonths' },
      { prefix: 'integration-mobile-face-send-event', label: 'integrationPerm.mobileFaceSendEvent' },
      { prefix: 'integration-mobile-face-check-worker', label: 'integrationPerm.mobileFaceCheckWorker' },
      { prefix: 'integration-mobile-face-schedules', label: 'integrationPerm.mobileFaceSchedules' },
      { prefix: 'integration-otp-verify', label: 'integrationPerm.otpVerify' },
      { prefix: 'integration-holiday-greetings', label: 'integrationPerm.holidayGreetings' },
    ],
  },
]
