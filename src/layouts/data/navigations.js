import {
  Folder48Filled,
  LockClosed16Filled,
  Person32Filled,
  DocumentPerson20Filled,
  DocumentPerson16Filled,
  PersonNote24Filled,
  Person12Filled,
  DocumentAdd20Filled,
  TextBulletListSquare20Filled,
  ChannelShare20Filled,
  AirplaneTakeOff20Regular,
  PeopleCheckmark24Filled,
  PersonProhibited24Filled,
  WeatherSunnyLow20Filled,
  Grid20Filled,
  DocumentCopy24Filled,
  PersonClock24Filled,
  GridKanban20Filled,
  BriefcaseMedical20Filled,
  PersonAccounts24Filled,
  BookQuestionMark24Filled,
  Book20Filled,
  HatGraduation12Filled,
  ClipboardBulletListLtr20Filled,
  DocumentEdit20Filled,
  AccessTime24Filled,
  SlideMultipleSearch24Filled,
  Certificate24Filled,
  Organization12Filled,
  BookDatabase24Regular,
  RibbonStar24Filled,
  PeopleToolbox20Filled,
  ClockToolbox20Filled,
  AppFolder20Filled,
  HatGraduation24Filled,
  AppsList24Filled,
  RibbonStar20Filled,
  PeopleMoney24Filled,
  DocumentRibbon20Filled,
  CalendarLtr20Filled,
  Calculator24Regular,
  ShareScreenPerson20Filled,
  BuildingHome16Filled,
  DocumentRibbon24Filled,
  Briefcase48Filled,
  AppTitle24Filled,
  ContactCard16Filled,
  ArrowUpload16Filled,
  DesktopPulse24Filled,
  QrCode24Regular,
  ImageMultiple24Filled,
  AppsAddIn16Regular,
  AppFolder24Filled,
  ShiftsCheckmark20Regular,
  DocumentBulletList24Filled,
  ChatMultiple16Filled,
  CommentLightning20Filled,
  PersonVoice20Filled,
  AppsList20Regular,
  News24Regular,
  Tag16Filled,
  AppRecent24Filled
} from '@vicons/fluent'
import icons from '@assets/icons'
const {
  usersIcon,
  menuIcon,
  department2Icon,
  positionIcon,
  // attendenceIcon,
  contractIcon,
  commandIcon,
  additionalAgreementIcon,
  applicationsIcon,
  negotiatorsIcon,
  vacationIcon,
  signersIcon,
  tableIcon,
  medicalExaminationIcon,
  crownIcon,
  businessTripIcon,
  documentsIcon,
  openVacanciesIcon,
  organizationIcon
} = icons
import { AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

import { appPermissions } from '@/utils/index.js'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

export const navigations = [
  {
    label: 'navigation.hrm', // Kadrlar boshqaruvi
    path: AppPaths.Hrm,
    icon: Person32Filled,
    permission: appPermissions.hr,
    name: 'hr',

    children: [
      {
        label: 'dashboardPage.name', // Dashboard
        path: Utils.routeHrmPathMaker(AppPaths.Dashboard),
        icon: menuIcon,
        color: 'bg-dark',
        permission: appPermissions.hrDashboard
      },
      {
        label: 'workerPage.name', // Xodimlar
        path: Utils.routeHrmPathMaker(AppPaths.Worker),
        icon: usersIcon,
        color: 'bg-primary',
        permission: appPermissions.hrWorkers
      },
      {
        label: 'departmentPage.name', // Bo'linmalar
        path: Utils.routeHrmPathMaker(AppPaths.Department),
        icon: department2Icon,
        color: 'bg-warning',
        permission: appPermissions.hrDepartments
      },
      {
        label: 'departmentPositionPage.name', // Lavozimlar
        path: Utils.routeHrmPathMaker(AppPaths.DepartmentPosition),
        icon: positionIcon,
        color: 'bg-secondary',
        permission: appPermissions.hrPositions
      },
      {
        label: 'confirmation.name', // Shartnomalar
        path: Utils.routeHrmPathMaker(AppPaths.Contract),
        icon: contractIcon,
        color: 'bg-success',
        permission: appPermissions.hrContracts,
        name: 'contracts'
      },
      {
        label: 'documentPage.tabs.command', // Buyruqlar
        path: Utils.routeHrmPathMaker(AppPaths.Command),
        icon: commandIcon,
        color: 'bg-secondary',
        permission: appPermissions.hrCommands,
        name: 'commands'
      },
      {
        label: 'documentPage.tabs.adContract', // Qo'sh. kelishuv
        path: Utils.routeHrmPathMaker(AppPaths.AdContract),
        icon: additionalAgreementIcon,
        color: 'bg-warning',
        permission: appPermissions.hrContractAdditional,
        name: 'contract-additional'
      },
      {
        label: 'applicationPage.name', // Arizalar
        path: Utils.routeHrmPathMaker(AppPaths.Application),
        icon: applicationsIcon,
        color: 'bg-success',
        permission: appPermissions.hrWorkerApplications,
        name: 'worker-applications'
      },
      {
        label: 'confirmationPage.name', // Kelishuvchilar
        path: Utils.routeHrmPathMaker(AppPaths.Confirmation),
        icon: negotiatorsIcon,
        color: 'bg-dark',
        permission: appPermissions.hrConfirmations
      },
      {
        label: 'vacationPage.name', // Ta'tildagi xodimlar
        path: Utils.routeHrmPathMaker(AppPaths.Vacation),
        icon: vacationIcon,
        color: 'bg-primary',
        permission: appPermissions.hrVacations
      },
      {
        label: 'timesheetWorkerPage.name', // Tabelchilar
        path: Utils.routeHrmPathMaker(AppPaths.TimesheetDepartment),
        icon: signersIcon,
        color: 'bg-warning',
        permission: appPermissions.hrTableWorkers
      },
      {
        label: 'timesheetPage.name', // Tabellar
        path: Utils.routeHrmPathMaker(AppPaths.TimeSheet),
        icon: tableIcon,
        color: 'bg-secondary',
        permission: appPermissions.hrTable
      },
      {
        label: 'medPage.name', // Tibbiy ko'rik
        path: Utils.routeHrmPathMaker(AppPaths.Med),
        icon: medicalExaminationIcon,
        color: 'bg-success',
        permission: appPermissions.hrMed
      },
      {
        label: 'organizationLeaderPage.name', // Rahbariyat
        path: Utils.routeHrmPathMaker(AppPaths.OrganizationLeader),
        icon: crownIcon,
        color: 'bg-info',
        permission: appPermissions.hrLeaders
      },
      // {
      //     label: 'reportPage.name',
      //     path: Utils.routeHrmPathMaker(AppPaths.Slice),
      //     icon: PreviewLink16Filled,
      //     color: 'bg-info',
      //     permission: appPermissions.hrJobs,
      // },
      // {
      //     label: 'exportPage.name',
      //     path: Utils.routeHrmPathMaker(AppPaths.Export),
      //     icon: CloudArchive20Filled,
      //     color: 'bg-warning',
      //     permission: appPermissions.hrExport,
      // },
      {
        label: 'businessTrip.name', // Xizmat safari
        path: Utils.routeHrmPathMaker(AppPaths.BusinessTrip),
        icon: businessTripIcon,
        color: 'bg-info',
        permission: appPermissions.hrBusinessTrip
      },
      {
        label: 'documentArchive.name', // Hujjatlar bazasi
        path: Utils.routeHrmPathMaker(AppPaths.DocumentArchive),
        icon: documentsIcon,
        color: 'bg-success',
        permission: appPermissions.hrDocuments
      },
      {
        label: 'vacationSchedule.name', // Ta'tillar grafigi
        path: Utils.routeHrmPathMaker(AppPaths.VacationSchedule),
        icon: BookDatabase24Regular,
        color: 'bg-info',
        permission: appPermissions.admin
      },
      {
        label: 'vacancy.name', // Ochiq vakansiyalar
        path: Utils.routeHrmPathMaker(AppPaths.PublicVacancy),
        icon: openVacanciesIcon,
        color: 'bg-info',
        permission: appPermissions.hrPublicVacancy,
        disable: false
      },
      {
        label: 'punishment.name', // Intizomiy jazolar
        path: Utils.routeHrmPathMaker(AppPaths.Punishment),
        icon: PersonProhibited24Filled,
        color: 'bg-warning',
        permission: appPermissions.hrPunishment
      },
      {
        label: 'incentive.name', // Rag'batlantirishlar
        path: Utils.routeHrmPathMaker(AppPaths.Incentive),
        icon: RibbonStar24Filled,
        color: 'bg-success',
        permission: appPermissions.hrIncentives
      },
      {
        label: 'report.name', // Plan va Fakt
        path: Utils.routeHrmPathMaker(AppPaths.Report),
        icon: AppFolder20Filled,
        color: 'bg-info',
        permission: appPermissions.hrReport
      },
      {
        label: 'pensioner.name', // Pensionerlar
        path: Utils.routeHrmPathMaker(AppPaths.Pensioner),
        icon: AppFolder20Filled,
        color: 'bg-info',
        permission: appPermissions.hrReport
      },
      {
        label: 'lmsWorkerPage.name', // Malaka oshirish
        path: Utils.routeHrmPathMaker(AppPaths.LmsWorker),
        icon: AppsAddIn16Regular,
        color: 'bg-success',
        permission: appPermissions.lmsWorker
      },
      {
        label: 'specialReport.name', // Hisobotlar
        path: Utils.routeHrmPathMaker(AppPaths.SpecialReport),
        icon: AppFolder20Filled,
        color: 'bg-info',
        permission: appPermissions.hrReportExport
      },
      {
        label: 'structureReport.name', // Hisobot aylanmasi
        path: Utils.routeHrmPathMaker(AppPaths.StructureReport),
        icon: DocumentBulletList24Filled,
        color: 'bg-warning',
        permission: appPermissions.hrMonthlyReport
      }
    ]
  },
  {
    label: 'navigation.docFlow', // Hujjat aylanishi
    path: '/docflow',
    icon: DocumentPerson16Filled,
    permission: appPermissions.confirmation,
    name: 'confirmation',
    children: [
      {
        label: 'confirmation.name', // Shartnomalar
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfContract),
        icon: DocumentPerson20Filled,
        color: 'bg-dark',
        permission: appPermissions.confirmationContracts,
        name: 'contracts'
      },
      {
        label: 'documentPage.tabs.command', // Buyruqlar
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfCommand),
        icon: DocumentCopy24Filled,
        color: 'bg-primary',
        permission: appPermissions.confirmationCommands,
        name: 'commands'
      },
      {
        label: 'documentPage.tabs.adContract', // Qo'sh. kelishuv
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfAdContract),
        icon: DocumentAdd20Filled,
        color: 'bg-warning',
        permission: appPermissions.confirmationAddContracts,
        name: 'contract-additional'
      },
      {
        label: 'applicationPage.name', // Arizalar
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfApplication),
        icon: DocumentEdit20Filled,
        color: 'bg-info',
        permission: appPermissions.confirmationWorkerApplications,
        name: 'worker-application'
      },
      {
        label: 'timesheetPage.name', // Tabellar
        path: Utils.routeDocFlowPathMaker(AppPaths.TimeSheet),
        icon: GridKanban20Filled,
        color: 'bg-secondary',
        permission: appPermissions.confirmationTable
      },
      {
        label: 'vacationSchedule.name', // Ta'tillar grafigi
        path: Utils.routeDocFlowPathMaker(AppPaths.VacationSchedule),
        icon: BookDatabase24Regular,
        color: 'bg-info',
        permission: appPermissions.admin
      },
      {
        label: 'lmsCertificate.name', // Sertifikatlar
        path: Utils.routeDocFlowPathMaker(AppPaths.Certificate),
        icon: Certificate24Filled,
        color: 'bg-info',
        permission: appPermissions.confirmationLmsCertificate,
        name: 'lms-certificate'
      },
      {
        label: 'staffingApproval.name', // Shtatlar
        path: Utils.routeDocFlowPathMaker(AppPaths.Approval),
        icon: AppsList20Regular,
        color: 'bg-info',
        permission: appPermissions.confirmationStaffingApproval,
        name: 'staffing-approve'
      },
      {
        label: 'confirmationReport.name', // Hisobotlar
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfReport),
        icon: DocumentBulletList24Filled,
        color: 'bg-warning',
        permission: appPermissions.confirmation,
        name: 'conf-report'
      }
    ]
  },
  {
    label: 'navigation.attestation', // Attestatsiya
    path: AppPaths.Attestation,
    icon: PersonNote24Filled,
    permission: appPermissions.exam,
    children: [
      {
        label: 'topicPage.name', // Mavzular
        path: Utils.routeAttestationPathMaker(AppPaths.Topic),
        icon: Book20Filled,
        color: 'bg-warning',
        permission: appPermissions.examTopics
      },
      {
        label: 'categoryPage.name', // Kategoriyalar
        path: Utils.routeAttestationPathMaker(AppPaths.Category),
        icon: BookQuestionMark24Filled,
        color: 'bg-info',
        permission: appPermissions.examCategories
      },
      {
        label: t('examPage.name'), // Imtihonlar
        path: Utils.routeAttestationPathMaker(AppPaths.Exam),
        icon: HatGraduation12Filled,
        color: 'bg-secondary',
        permission: appPermissions.examExams
      },
      {
        label: t('examPage.result'), // Natijalar
        path: Utils.routeAttestationPathMaker(AppPaths.Result),
        icon: ClipboardBulletListLtr20Filled,
        color: 'bg-dark',
        permission: appPermissions.examResults
      }
    ]
  },
  {
    label: 'navigation.turnstile', // Turniket
    path: AppPaths.Turnstile,
    icon: AccessTime24Filled,
    permission: appPermissions.turnstile,
    children: [
      {
        label: 'turnStileDashboard.name', // Dashboard
        path: Utils.routeTurnstilePathMaker(AppPaths.Dashboard),
        icon: Grid20Filled,
        color: 'bg-dark',
        permission: appPermissions.turnstileDashboard
      },
      // {
      //     label: 'turnstile.buildingPage.title',
      //     path: Utils.routeTurnstilePathMaker(AppPaths.Building),
      //     icon: BuildingMultiple24Filled,
      //     color: 'bg-dark',
      //     permission: appPermissions.turnstileBuilding,
      // },
      // {
      //     label: 'turnstile.terminalPage.title',
      //     path: Utils.routeTurnstilePathMaker(AppPaths.Terminal),
      //     icon: ScanObject24Filled,
      //     color: 'bg-secondary',
      //     permission: appPermissions.turnstileTerminal,
      // },
      // {
      //     label: 'turnstile.organization.title',
      //     path: Utils.routeTurnstilePathMaker(AppPaths.Organizations),
      //     icon: Organization12Filled,
      //     color: 'bg-info',
      //     permission: appPermissions.turnstileOrganization,
      // },
      // {
      //     label: 'turnstile.terminalUser.title',
      //     path: Utils.routeTurnstilePathMaker(AppPaths.User),
      //     icon: PeopleToolbox20Filled,
      //     color: 'bg-warning',
      //     permission: appPermissions.turnstileWorkers,
      // },
      // {
      //     label: 'turnstile.workDurationPage.name',
      //     path: Utils.routeTurnstilePathMaker(AppPaths.WorkDuration),
      //     icon: ClockToolbox20Filled,
      //     color: 'bg-success',
      //     permission: appPermissions.turnstileWorkDuration,
      // },
      {
        label: 'turnstile.accessLevelPage.name', // Guruhlar
        path: Utils.routeTurnstilePathMaker(AppPaths.AccessLevels),
        icon: ClockToolbox20Filled,
        color: 'bg-info',
        permission: appPermissions.turnstileAccessLevels
      },
      {
        label: 'turnstile.orgAccessLevelsPage.name', // Tashkilot va guruhlar
        path: Utils.routeTurnstilePathMaker(AppPaths.OrgAccessLevels),
        icon: Organization12Filled,
        color: 'bg-secondary',
        permission: appPermissions.turnstileOrganizationAccessLevels
      },
      {
        label: 'turnstile.hcWorkersPage.name', // Xodimlar
        path: Utils.routeTurnstilePathMaker(AppPaths.HcWorkers),
        icon: PeopleToolbox20Filled,
        color: 'bg-warning',
        permission: appPermissions.turnstileHikCentralWorkers
      },
      // {
      //     label: 'hcServer.name',
      //     path: Utils.routeTurnstilePathMaker(AppPaths.HcServer),
      //     icon: CellularData124Filled,
      //     color: 'bg-info',
      //     permission: appPermissions.turnstileHikCentralJob,
      // },
      {
        label: 'hcEvent.name', // Hodisalar
        path: Utils.routeTurnstilePathMaker(AppPaths.HcEvents),
        icon: ContactCard16Filled,
        color: 'bg-info',
        permission: appPermissions.turnstileHikCentralEvents
      },
      // {
      //     label: 'hcEvent.nameV2',
      //     path: Utils.routeTurnstilePathMaker(AppPaths.HcEventsV2),
      //     icon: ContactCard16Filled,
      //     color: 'bg-info',
      //     permission: appPermissions.turnstileHikCentralEvents,
      // },
      // {
      //     label: 'syncLog.name',
      //     path: Utils.routeTurnstilePathMaker(AppPaths.SyncLog),
      //     icon: ArrowSyncCircle24Filled,
      //     color: 'bg-success',
      //     permission: appPermissions.turnstileHikCentralSync,
      // },
      {
        label: 'workerImage.name', // Telegram rasmlari
        path: Utils.routeTurnstilePathMaker(AppPaths.WorkerImage),
        icon: ImageMultiple24Filled,
        color: 'bg-primary',
        permission: appPermissions.turnstileWorkerImage
      },
      // {
      //     label: 'hcWorkDuration.name',
      //     path: Utils.routeTurnstilePathMaker(AppPaths.HCWorkDuration),
      //     icon: Clock24Filled,
      //     color: 'bg-success',
      //     permission: appPermissions.turnstileHcpDuration,
      // },
      {
        label: 'devices.name', // Qurilmalar
        path: Utils.routeTurnstilePathMaker(AppPaths.Devices),
        icon: DesktopPulse24Filled,
        color: 'bg-info',
        permission: appPermissions.turnstileDevices
      },
      {
        label: 'additionalPage.name', // Qo'shimcha
        path: Utils.routeTurnstilePathMaker(AppPaths.Others),
        icon: DocumentBulletList24Filled,
        color: 'bg-primary',
        permission: appPermissions.turnstileOthers
      },
      {
        label: 'schedule.name', // Navbatchilik grafigi
        path: Utils.routeTurnstilePathMaker(AppPaths.Schedule),
        icon: DocumentBulletList24Filled,
        color: 'bg-dark',
        permission: appPermissions.turnstileSheets
      },
      {
        label: 'shiftType.name', // Smenalar
        path: Utils.routeTurnstilePathMaker(AppPaths.ShiftType),
        icon: DocumentBulletList24Filled,
        color: 'bg-dark',
        permission: appPermissions.turnstileSheetsWorkers
      },
      {
        label: 'shiftType.groupName', // Smena guruhlari
        path: Utils.routeTurnstilePathMaker(AppPaths.ShiftTypeGroup),
        icon: DocumentBulletList24Filled,
        color: 'bg-dark',
        permission: appPermissions.turnstileSheetsGroups
      },
      {
        label: 'turnstileSchedule.name', // Turniket grafiki
        path: Utils.routeTurnstilePathMaker(AppPaths.TurnstileSchedule),
        icon: DocumentBulletList24Filled,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'approve.name', // Yuborilgan xodimlar
        path: Utils.routeTurnstilePathMaker(AppPaths.Approve),
        icon: PersonVoice20Filled,
        color: 'bg-success',
        permission: appPermissions.turnstileApprove
      }
    ]
  },
  {
    label: 'navigation.general', // Umumiy
    path: AppPaths.Info,
    icon: SlideMultipleSearch24Filled,
    permission: appPermissions.useful,
    children: []
  },
  {
    label: 'navigation.lms', // O'quv boshqaruvi
    path: AppPaths.Lms,
    icon: HatGraduation24Filled,
    permission: appPermissions.lms,
    children: [
      {
        label: 'directionPage.name', // Yo'nalishlar
        path: Utils.routeLmsPathMaker(AppPaths.Direction),
        icon: AppsList24Filled,
        color: 'bg-dark',
        permission: appPermissions.lmsDirection
      },
      {
        label: 'specializationPage.name', // Ixtisosliklar
        path: Utils.routeLmsPathMaker(AppPaths.Specialization),
        icon: RibbonStar20Filled,
        color: 'bg-secondary',
        permission: appPermissions.lmsSpecialization
      },
      {
        label: 'subjectPage.name', // Fanlar (modullar)
        path: Utils.routeLmsPathMaker(AppPaths.Subject),
        icon: DocumentRibbon20Filled,
        color: 'bg-primary',
        permission: appPermissions.lmsSubjects
      },
      {
        label: 'eduPlanPage.name', // O'quv rejasi
        path: Utils.routeLmsPathMaker(AppPaths.EduPlan),
        icon: CalendarLtr20Filled,
        color: 'bg-warning',
        permission: appPermissions.lmsEduPlan
      },
      {
        label: 'teacherPage.name', // Pedagoglar
        path: Utils.routeLmsPathMaker(AppPaths.Teacher),
        icon: ShareScreenPerson20Filled,
        color: 'bg-info',
        permission: appPermissions.lmsTeachers
      },
      {
        label: 'lessonPage.name', // Mashg'ulotlar
        path: Utils.routeLmsPathMaker(AppPaths.Lesson),
        icon: AppsAddIn16Regular,
        color: 'bg-info',
        permission: appPermissions.lmsLessons
      },
      {
        label: 'teacherLesson.name', // Darslar
        path: Utils.routeLmsPathMaker(AppPaths.TeacherLesson),
        icon: ShiftsCheckmark20Regular,
        color: 'bg-info',
        permission: appPermissions.admin
      },
      {
        label: 'listener.name', // Tinglovchilar
        path: Utils.routeLmsPathMaker(AppPaths.Listener),
        icon: ShiftsCheckmark20Regular,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'resultPage.name', // Natijalar
        path: Utils.routeLmsPathMaker(AppPaths.Result),
        icon: AppsList24Filled,
        color: 'bg-info',
        permission: appPermissions.admin
      },
      {
        label: 'lmsCertificate.name', // Sertifikatlar
        path: Utils.routeLmsPathMaker(AppPaths.Certificate),
        icon: Certificate24Filled,
        color: 'bg-info',
        permission: appPermissions.lmsCertificate
      }
    ]
  },
  {
    label: 'navigation.economist', // Iqtisodchi
    path: AppPaths.Accountant,
    icon: PeopleMoney24Filled,
    permission: appPermissions.economist,
    children: [
      {
        label: 'accDashboard.name', // Dashboard
        path: Utils.routeAccountantPathMaker(AppPaths.Dashboard),
        icon: Grid20Filled,
        color: 'bg-dark',
        permission: appPermissions.economistDashboard
      },
      {
        label: 'salaryCategory.name', // Ish haqi fondi
        path: Utils.routeAccountantPathMaker(AppPaths.SalaryCategory),
        icon: AppTitle24Filled,
        color: 'bg-dark',
        permission: appPermissions.economistWorkerCategories
      },
      {
        label: 'uploadReport.name', // Hisobot yuklash
        path: Utils.routeAccountantPathMaker(AppPaths.UploadReport),
        icon: ArrowUpload16Filled,
        color: 'bg-success',
        permission: appPermissions.economistUploads
      },
      {
        label: 'monthReport.name', // Oylik hisobot
        path: Utils.routeAccountantPathMaker(AppPaths.MonthReport),
        icon: Calculator24Regular,
        color: 'bg-warning',
        permission: appPermissions.economistStatements
      },
      {
        label: 'salaryReport.name', // Oylik hisobot (shifr)
        path: Utils.routeAccountantPathMaker(AppPaths.SalaryReport),
        icon: QrCode24Regular,
        color: 'bg-dark',
        permission: appPermissions.economistStatementsCode
      },
      {
        label: 'taxFour.name', // JSHDS 4-ilova
        path: Utils.routeAccountantPathMaker(AppPaths.TaxFour),
        icon: Calculator24Regular,
        color: 'bg-success',
        permission: appPermissions.economistTaxFour
      },
      {
        label: 'taxFive.name', // JSHDS 5-ilova
        path: Utils.routeAccountantPathMaker(AppPaths.TaxFive),
        icon: Calculator24Regular,
        color: 'bg-info',
        permission: appPermissions.economistTaxFive
      },
      {
        label: 'pensionPayment.name', // SHJPH (INPS) to'lov
        path: Utils.routeAccountantPathMaker(AppPaths.PensionPayment),
        icon: Calculator24Regular,
        color: 'bg-success',
        permission: appPermissions.economistPensionPayments
      },
      {
        label: 'report.name', // Plan va Fakt
        path: Utils.routeAccountantPathMaker(AppPaths.Report),
        icon: AppFolder20Filled,
        color: 'bg-info',
        permission: appPermissions.hrReport
      },
      {
        label: 'staffingApproval.name', // Shtatlar
        path: Utils.routeAccountantPathMaker(AppPaths.Approval),
        icon: AppsList20Regular,
        color: 'bg-info',
        permission: appPermissions.economistStaffingApprove
      }
    ]
  },
  {
    label: 'navigation.hospital', // Kasalxona
    path: AppPaths.Hospital,
    icon: BuildingHome16Filled,
    permission: appPermissions.hospital,
    children: [
      {
        label: 'expiredHealth.name', // Tibbiy ko'rik
        path: Utils.routeHospitalPathMaker(AppPaths.ExpiredHealth),
        icon: BriefcaseMedical20Filled,
        color: 'bg-warning',
        permission: appPermissions.hospitalExpired
      },
      {
        label: 'ticket.name', // Yo'llanmalar
        path: Utils.routeHospitalPathMaker(AppPaths.Ticket),
        icon: DocumentRibbon24Filled,
        color: 'bg-success',
        permission: appPermissions.hospitalTicket
      },
      {
        label: 'medWorker.name', // Barcha xodimlar
        path: Utils.routeHospitalPathMaker(AppPaths.MedWorker),
        icon: DocumentRibbon24Filled,
        color: 'bg-info',
        permission: appPermissions.hospitalTicket
      },
      {
        label: 'pensioner.name', // Pensionerlar
        path: Utils.routeHospitalPathMaker(AppPaths.Pensioner),
        icon: AppFolder24Filled,
        color: 'bg-info',
        permission: appPermissions.hospitalPensioner
      }
    ]
  },
  {
    label: 'navigation.chat', // Chat
    path: AppPaths.Chat,
    icon: ChatMultiple16Filled,
    permission: appPermissions.admin,
    children: [
      {
        label: 'notificationPage.name', // Bildirishnomalar
        path: Utils.routeChatPathMaker(AppPaths.Notification),
        icon: CommentLightning20Filled,
        color: 'bg-dark',
        permission: appPermissions.instructions
      },
      {
        label: 'newsPage.name', // Yangiliklar
        path: Utils.routeChatPathMaker(AppPaths.News),
        icon: News24Regular,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'newsCategoryPage.name', // Yangilik kategoriyalari
        path: Utils.routeChatPathMaker(AppPaths.NewsCategory),
        icon: Tag16Filled,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'congratulation.name', // Telegram xabarlar
        path: Utils.routeChatPathMaker(AppPaths.Congratulation),
        icon: CommentLightning20Filled,
        color: 'bg-warning',
        permission: appPermissions.chatTelegramMessages
      }
    ]
  },
  {
    label: 'navigation.extra', // Qo'shimchalar
    path: AppPaths.Extra,
    icon: AppRecent24Filled,
    permission: appPermissions.extra,
    children: [
      {
        label: 'workerRole.name', // Foydalanuvchilar
        path: Utils.routeExtraPathMaker(AppPaths.WorkerRole),
        icon: PeopleCheckmark24Filled,
        color: 'bg-primary',
        permission: appPermissions.extraWorkerUser
      },
      {
        label: 'educationDirectory.name', // Ta'lim katalogi
        path: Utils.routeExtraPathMaker(AppPaths.AdminOther),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.educationsStructureMenu
      },
      {
        label: 'departmentLocationPage.name', // Bo'lim joylashuvi
        path: Utils.routeExtraPathMaker(AppPaths.DepartmentLocation),
        icon: ChannelShare20Filled,
        color: 'bg-info',
        permission: appPermissions.departmentLocation
      }
    ]
  },
  {
    label: 'navigation.admin', // Admin
    path: AppPaths.Admin,
    icon: LockClosed16Filled,
    permission: appPermissions.admin,
    children: [
      {
        label: 'userPage.name', // Foydalanuvchilar
        path: Utils.routePathMaker(AppPaths.User),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.users
      },
      {
        label: 'userRole.name', // Rollar
        path: Utils.routePathMaker(AppPaths.UserRole),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.roles
      },
      {
        label: 'userPermission.name', // Huquqlar
        path: Utils.routePathMaker(AppPaths.UserPermission),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.permissions
      },
      {
        label: 'countryPage.name', // Davlatlar
        path: Utils.routePathMaker(AppPaths.Country),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.countries
      },
      {
        label: 'regionPage.name', // Viloyatlar
        path: Utils.routePathMaker(AppPaths.Region),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.regions
      },
      {
        label: 'districtPage.name', // Tumanlar
        path: Utils.routePathMaker(AppPaths.District),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.cities
      },
      {
        label: 'nationalityPage.name', // Millatlar
        path: Utils.routePathMaker(AppPaths.Nationality),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.nationalities
      },
      {
        label: 'positionPage.name', // Lavozimlar
        path: Utils.routePathMaker(AppPaths.Position),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.positions
      },
      {
        label: 'schedulePage.name', // Ish jadvali
        path: Utils.routePathMaker(AppPaths.Schedule),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.schedules
      },
      {
        label: 'workdayPage.name', // Ish kunlari
        path: Utils.routePathMaker(AppPaths.Workday),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.workDay
      },
      {
        label: 'organizationPage.name', // Tashkilotlar
        path: Utils.routePathMaker(AppPaths.Organizations),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.organizations
      },
      {
        label: 'actionLog.name', // Amallar tarixi
        path: Utils.routePathMaker(AppPaths.ActionLog),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.activityLogs
      },
      {
        label: 'documentSetting.name', // Hujjat sozlamalari
        path: Utils.routePathMaker(AppPaths.DocumentSetting),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.documentExamples
      },
      {
        label: 'holidayPage.name', // Bayram kunlari
        path: Utils.routePathMaker(AppPaths.Holiday),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.holidays
      },
      {
        label: 'othersPage.name', // Boshqalar
        path: Utils.routePathMaker(AppPaths.AdminOther),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.universities
      },
      {
        label: 'telegramPage.name', // Telegram
        path: Utils.routePathMaker(AppPaths.Telegram),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.telegram
      },
      {
        label: 'learningCenterPage.name', // O'quv markazlari
        path: Utils.routePathMaker(AppPaths.LearningCenter),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.learningCenters
      },
      {
        label: 'instructionPage.name', // Instruksiya
        path: Utils.routePathMaker(AppPaths.Instruction),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.instructions
      },
      {
        label: 'mobileUserPage.name', // Mobil foydalanuvchilar
        path: Utils.routePathMaker(AppPaths.MobileUsers),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'vacancyApprovePage.menuName', // Tasdiqlash
        path: Utils.routePathMaker(AppPaths.VacancyApprove),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'integrationLog.name', // Integratsiya loglari
        path: Utils.routePathMaker(AppPaths.IntegrationLog),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'integrationClients.name', // Integratsiya clientlari
        path: Utils.routePathMaker(AppPaths.IntegrationClients),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'workerReport.name', // Xodim hisobotlari
        path: Utils.routePathMaker(AppPaths.WorkerReport),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.admin
      }
    ]
  }
]

export const otherNavigations = [
  {
    label: 'loginPage.name', // Xush kelibsiz
    path: AppPaths.Login,
    icon: 'bx bxs-user-circle'
  },
  {
    label: 'registerPage.name', // Ro'yhatdan o'tish
    path: AppPaths.Register,
    icon: 'bx bxs-user-circle'
  }
]
