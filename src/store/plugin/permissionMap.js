/**
 * Store → ruxsat prefiksi xaritasi.
 *
 * `permissionGuard.js` shu jadvalga qarab store'ning `_create` / `_update` / `_delete`
 * amallarini qo'riqlaydi. Sabab: mutatsiya handlerlarining katta qismi (audit paytida
 * 362 tadan 206 tasi) hech qanday ruxsat tekshiruvisiz edi va ularni 200+ komponentda
 * birma-bir tuzatish ko'rib chiqib bo'lmaydigan diff bo'lardi. Store — barcha chaqiruv
 * yo'llari (dropdown, kontekst-menyu, klaviatura, dasturiy chaqiruv) kesishadigan
 * yagona cho'kma nuqta.
 *
 * QOIDALAR
 * 1. Bu yerda YO'Q store umuman cheklanmaydi (fail-open). Ya'ni xato/unutilgan yozuv
 *    hech qachon ishlayotgan sahifani buzmaydi — eng yomoni himoyasiz qoldiradi.
 * 2. Amal faqat backend uni HAQIQATAN enforce qilsa tekshiriladi (`ENFORCED`).
 *    Frontend hech qachon backend'dan qattiqroq bo'lmaydi.
 * 3. Noaniq store'lar ATAYLAB qo'shilmagan (izohlarga qarang) — noto'g'ri prefiks
 *    yozgandan ko'ra tekshirmagan yaxshiroq.
 *
 * Prefiksga `-create`/`-update` uchun `-write`, `-delete` uchun `-delete` qo'shiladi.
 */
export const STORE_PERMISSIONS = {
  // ── Admin
  country: 'countries',
  regionStore: 'regions',
  districtStore: 'cities',
  nationalityStore: 'nationalities',
  positionStore: 'positions',
  scheduleStore: 'schedules',
  workdayStore: 'work-day',
  organizationStore: 'organizations',
  holidayStore: 'holidays',
  holidayGreetingStore: 'holiday-greetings',
  learningCenterStore: 'learning-centers',
  pageInstructionStore: 'instructions',
  telegramStore: 'telegram',
  user: 'users',
  userRole: 'roles',
  userPermission: 'permissions',
  integrationClients: 'integration-clients',
  languageAdminStore: 'languages',
  specialityStore: 'specialities',
  universityAdminStore: 'universities',

  // ── HR
  workerStore: 'hr-workers',
  workerProfileStore: 'hr-workers',
  departmentStore: 'hr-departments',
  departmentPositionStore: 'hr-positions',
  confirmationStore: 'hr-confirmations',
  vacationStore: 'hr-confirmations',
  vacationScheduleStore: 'hr-vacation-schedule',
  documentArchiveStore: 'hr-documents',
  organizationLeaderStore: 'hr-leaders',
  medStore: 'hr-med',
  pensionerStore: 'hr-pensioners',
  vacancyStore: 'hr-public-vacancy',
  report2Store: 'hr-report',
  timesheetDepartmentStore: 'hr-table',

  // ── Hujjat aylanishi (nomlari bir ma'noli)
  contractStore: 'hr-contracts',
  adContractStore: 'hr-contract-additional',
  commandStore: 'hr-commands',
  applicationStore: 'hr-worker-applications',

  // ── Attestatsiya
  categoryStore: 'exam-categories',
  categoryQuestionStore: 'exam-categories',
  topicStore: 'exam-topics',

  // ── LMS
  directionStore: 'lms-direction',
  specializationStore: 'lms-specialization',
  subjectStore: 'lms-subjects',
  eduPlanStore: 'lms-edu-plan',
  teacherStore: 'lms-teachers',
  lmsLessonStore: 'lms-lessons',
  teacherLessonStore: 'lms-lessons',
  lmsCertificateStore: 'lms-certificate',

  // ── Turniket
  turnstileBuildingStore: 'turnstile-building',
  turnstileTerminalStore: 'turnstile-terminal',
  turnstileTerminalUserStore: 'turnstile-workers',
  turnstileHikCentralWorkerStore: 'turnstile-hik-central-workers',
  devicesStore: 'turnstile-devices',
  approveStore: 'turnstile-approve',

  // ── Buxgalteriya
  uploadReport: 'economist-uploads',
  salaryCategoryStore: 'economist-worker-categories',
  staffingApprovalStore: 'economist-staffing-approve'

  // ATAYLAB XARITASIZ (fail-open):
  //  • accountStore — foydalanuvchining O'Z profili, ruxsat talab qilinmaydi.
  //  • confApplicationStore, confCertificateStore, confirmationAdContractStore,
  //    confirmationContractStore, timesheetStore — bular tasdiqlash oqimlari;
  //    `_update` foydalanuvchi yozuvi emas, balki status o'zgarishi bo'lishi mumkin.
  //  • topicExamStore, topicFileStore, turnstileHikCentralStore — qaysi prefiksga
  //    tegishli ekani aniq emas (bir necha nomzod).
  //  • Qolgan ~35 store — mos ENFORCED prefiksi topilmadi (backend ularni
  //    enforce qilmaydi), shuning uchun cheklashning ma'nosi yo'q.
}
