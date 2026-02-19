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
  Tag16Filled
} from '@vicons/fluent'
import { AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

import { appPermissions } from '@/utils/index.js'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

export const navigations = [
  {
    label: 'navigation.hrm',
    path: AppPaths.Hrm,
    icon: Person32Filled,
    permission: appPermissions.hr,
    name: 'hr',

    children: [
      {
        label: 'dashboardPage.name',
        path: Utils.routeHrmPathMaker(AppPaths.Dashboard),
        icon: Grid20Filled,
        color: 'bg-dark',
        permission: appPermissions.hrDashboard
      },
      {
        label: 'workerPage.name',
        path: Utils.routeHrmPathMaker(AppPaths.Worker),
        icon: Person12Filled,
        color: 'bg-primary',
        permission: appPermissions.hrWorkers
      },
      {
        label: 'departmentPage.name',
        path: Utils.routeHrmPathMaker(AppPaths.Department),
        icon: ChannelShare20Filled,
        color: 'bg-warning',
        permission: appPermissions.hrDepartments
      },
      {
        label: 'departmentPositionPage.name',
        path: Utils.routeHrmPathMaker(AppPaths.DepartmentPosition),
        icon: TextBulletListSquare20Filled,
        color: 'bg-secondary',
        permission: appPermissions.hrPositions
      },
      {
        label: 'confirmation.name',
        path: Utils.routeHrmPathMaker(AppPaths.Contract),
        icon: DocumentPerson20Filled,
        color: 'bg-success',
        permission: appPermissions.hrContracts,
        name: 'contracts'
      },
      {
        label: 'documentPage.tabs.command',
        path: Utils.routeHrmPathMaker(AppPaths.Command),
        icon: DocumentCopy24Filled,
        color: 'bg-secondary',
        permission: appPermissions.hrCommands,
        name: 'commands'
      },
      {
        label: 'documentPage.tabs.adContract',
        path: Utils.routeHrmPathMaker(AppPaths.AdContract),
        icon: DocumentAdd20Filled,
        color: 'bg-warning',
        permission: appPermissions.hrContractAdditional,
        name: 'contract-additional'
      },
      {
        label: 'applicationPage.name',
        path: Utils.routeHrmPathMaker(AppPaths.Application),
        icon: DocumentEdit20Filled,
        color: 'bg-success',
        permission: appPermissions.hrWorkerApplications,
        name: 'worker-applications'
      },
      {
        label: 'confirmationPage.name',
        path: Utils.routeHrmPathMaker(AppPaths.Confirmation),
        icon: PeopleCheckmark24Filled,
        color: 'bg-dark',
        permission: appPermissions.hrConfirmations
      },
      {
        label: 'vacationPage.name',
        path: Utils.routeHrmPathMaker(AppPaths.Vacation),
        icon: WeatherSunnyLow20Filled,
        color: 'bg-primary',
        permission: appPermissions.hrVacations
      },
      {
        label: 'timesheetWorkerPage.name',
        path: Utils.routeHrmPathMaker(AppPaths.TimesheetDepartment),
        icon: PersonClock24Filled,
        color: 'bg-warning',
        permission: appPermissions.hrTableWorkers
      },
      {
        label: 'timesheetPage.name',
        path: Utils.routeHrmPathMaker(AppPaths.TimeSheet),
        icon: GridKanban20Filled,
        color: 'bg-secondary',
        permission: appPermissions.hrTable
      },
      {
        label: 'medPage.name',
        path: Utils.routeHrmPathMaker(AppPaths.Med),
        icon: BriefcaseMedical20Filled,
        color: 'bg-success',
        permission: appPermissions.hrMed
      },
      {
        label: 'organizationLeaderPage.name',
        path: Utils.routeHrmPathMaker(AppPaths.OrganizationLeader),
        icon: PersonAccounts24Filled,
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
        label: 'businessTrip.name',
        path: Utils.routeHrmPathMaker(AppPaths.BusinessTrip),
        icon: AirplaneTakeOff20Regular,
        color: 'bg-secondary',
        permission: appPermissions.hrBusinessTrip
      },
      {
        label: 'documentArchive.name',
        path: Utils.routeHrmPathMaker(AppPaths.DocumentArchive),
        icon: BookDatabase24Regular,
        color: 'bg-success',
        permission: appPermissions.hrDocuments
      },
      {
        label: 'vacationSchedule.name',
        path: Utils.routeHrmPathMaker(AppPaths.VacationSchedule),
        icon: BookDatabase24Regular,
        color: 'bg-info',
        permission: appPermissions.admin
      },
      {
        label: 'vacancy.name',
        path: Utils.routeHrmPathMaker(AppPaths.PublicVacancy),
        icon: Briefcase48Filled,
        color: 'bg-info',
        permission: appPermissions.hrUsers,
        disable: true
      },
      {
        label: 'punishment.name',
        path: Utils.routeHrmPathMaker(AppPaths.Punishment),
        icon: PersonProhibited24Filled,
        color: 'bg-warning',
        permission: appPermissions.hrPunishment
      },
      {
        label: 'incentive.name',
        path: Utils.routeHrmPathMaker(AppPaths.Incentive),
        icon: RibbonStar24Filled,
        color: 'bg-success',
        permission: appPermissions.hrIncentives
      },
      {
        label: 'report.name',
        path: Utils.routeHrmPathMaker(AppPaths.Report),
        icon: AppFolder20Filled,
        color: 'bg-info',
        permission: appPermissions.hrReport
      },
      {
        label: 'pensioner.name',
        path: Utils.routeHrmPathMaker(AppPaths.Pensioner),
        icon: AppFolder20Filled,
        color: 'bg-info',
        permission: appPermissions.hrReport
      },
      {
        label: 'lmsWorkerPage.name',
        path: Utils.routeHrmPathMaker(AppPaths.LmsWorker),
        icon: AppsAddIn16Regular,
        color: 'bg-success',
        permission: appPermissions.lmsWorker
      },
      {
        label: 'specialReport.name',
        path: Utils.routeHrmPathMaker(AppPaths.SpecialReport),
        icon: AppFolder20Filled,
        color: 'bg-info',
        permission: appPermissions.hrReportExport
      }
    ]
  },
  {
    label: 'navigation.docFlow',
    path: '/docflow',
    icon: DocumentPerson16Filled,
    permission: appPermissions.confirmation,
    name: 'confirmation',
    children: [
      {
        label: 'confirmation.name',
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfContract),
        icon: DocumentPerson20Filled,
        color: 'bg-dark',
        permission: appPermissions.confirmationContracts,
        name: 'contracts'
      },
      {
        label: 'documentPage.tabs.command',
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfCommand),
        icon: DocumentCopy24Filled,
        color: 'bg-primary',
        permission: appPermissions.confirmationCommands,
        name: 'commands'
      },
      {
        label: 'documentPage.tabs.adContract',
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfAdContract),
        icon: DocumentAdd20Filled,
        color: 'bg-warning',
        permission: appPermissions.confirmationAddContracts,
        name: 'contract-additional'
      },
      {
        label: 'applicationPage.name',
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfApplication),
        icon: DocumentEdit20Filled,
        color: 'bg-info',
        permission: appPermissions.confirmationWorkerApplications,
        name: 'worker-application'
      },
      {
        label: 'timesheetPage.name',
        path: Utils.routeDocFlowPathMaker(AppPaths.TimeSheet),
        icon: GridKanban20Filled,
        color: 'bg-secondary',
        permission: appPermissions.confirmationTable
      },
      {
        label: 'vacationSchedule.name',
        path: Utils.routeDocFlowPathMaker(AppPaths.VacationSchedule),
        icon: BookDatabase24Regular,
        color: 'bg-info',
        permission: appPermissions.admin
      },
      {
        label: 'lmsCertificate.name',
        path: Utils.routeDocFlowPathMaker(AppPaths.Certificate),
        icon: Certificate24Filled,
        color: 'bg-info',
        permission: appPermissions.confirmationLmsCertificate,
        name: 'lms-certificate'
      },
      {
        label: 'staffingApproval.name',
        path: Utils.routeDocFlowPathMaker(AppPaths.Approval),
        icon: AppsList20Regular,
        color: 'bg-info',
        permission: appPermissions.confirmationStaffingApproval,
        name: 'staffing-approve'
      }
    ]
  },
  {
    label: 'navigation.attestation',
    path: AppPaths.Attestation,
    icon: PersonNote24Filled,
    permission: appPermissions.exam,
    children: [
      {
        label: 'topicPage.name',
        path: Utils.routeAttestationPathMaker(AppPaths.Topic),
        icon: Book20Filled,
        color: 'bg-warning',
        permission: appPermissions.examTopics
      },
      {
        label: 'categoryPage.name',
        path: Utils.routeAttestationPathMaker(AppPaths.Category),
        icon: BookQuestionMark24Filled,
        color: 'bg-info',
        permission: appPermissions.examCategories
      },
      {
        label: t('examPage.name'),
        path: Utils.routeAttestationPathMaker(AppPaths.Exam),
        icon: HatGraduation12Filled,
        color: 'bg-secondary',
        permission: appPermissions.examExams
      },
      {
        label: t('examPage.result'),
        path: Utils.routeAttestationPathMaker(AppPaths.Result),
        icon: ClipboardBulletListLtr20Filled,
        color: 'bg-dark',
        permission: appPermissions.examResults
      }
    ]
  },
  {
    label: 'navigation.turnstile',
    path: AppPaths.Turnstile,
    icon: AccessTime24Filled,
    permission: appPermissions.turnstile,
    children: [
      {
        label: 'turnStileDashboard.name',
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
        label: 'turnstile.accessLevelPage.name',
        path: Utils.routeTurnstilePathMaker(AppPaths.AccessLevels),
        icon: ClockToolbox20Filled,
        color: 'bg-info',
        permission: appPermissions.turnstileAccessLevels
      },
      {
        label: 'turnstile.orgAccessLevelsPage.name',
        path: Utils.routeTurnstilePathMaker(AppPaths.OrgAccessLevels),
        icon: Organization12Filled,
        color: 'bg-secondary',
        permission: appPermissions.turnstileOrganizationAccessLevels
      },
      {
        label: 'turnstile.hcWorkersPage.name',
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
        label: 'hcEvent.name',
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
        label: 'workerImage.name',
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
        label: 'devices.name',
        path: Utils.routeTurnstilePathMaker(AppPaths.Devices),
        icon: DesktopPulse24Filled,
        color: 'bg-info',
        permission: appPermissions.turnstileDevices
      },
      {
        label: 'additionalPage.name',
        path: Utils.routeTurnstilePathMaker(AppPaths.Others),
        icon: DocumentBulletList24Filled,
        color: 'bg-primary',
        permission: appPermissions.turnstileOthers
      },
      {
        label: 'schedule.name',
        path: Utils.routeTurnstilePathMaker(AppPaths.Schedule),
        icon: DocumentBulletList24Filled,
        color: 'bg-dark',
        permission: appPermissions.turnstileSheets
      },
      {
        label: 'shiftType.name',
        path: Utils.routeTurnstilePathMaker(AppPaths.ShiftType),
        icon: DocumentBulletList24Filled,
        color: 'bg-dark',
        permission: appPermissions.turnstileSheetsWorkers
      },
      {
        label: 'shiftType.groupName',
        path: Utils.routeTurnstilePathMaker(AppPaths.ShiftTypeGroup),
        icon: DocumentBulletList24Filled,
        color: 'bg-dark',
        permission: appPermissions.turnstileSheetsGroups
      },
      {
        label: 'turnstileSchedule.name',
        path: Utils.routeTurnstilePathMaker(AppPaths.TurnstileSchedule),
        icon: DocumentBulletList24Filled,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'approve.name',
        path: Utils.routeTurnstilePathMaker(AppPaths.Approve),
        icon: PersonVoice20Filled,
        color: 'bg-success',
        permission: appPermissions.turnstileApprove
      }
    ]
  },
  {
    label: 'navigation.general',
    path: AppPaths.Info,
    icon: SlideMultipleSearch24Filled,
    permission: appPermissions.useful,
    children: []
  },
  {
    label: 'navigation.lms',
    path: AppPaths.Lms,
    icon: HatGraduation24Filled,
    permission: appPermissions.lms,
    children: [
      {
        label: 'directionPage.name',
        path: Utils.routeLmsPathMaker(AppPaths.Direction),
        icon: AppsList24Filled,
        color: 'bg-dark',
        permission: appPermissions.lmsDirection
      },
      {
        label: 'specializationPage.name',
        path: Utils.routeLmsPathMaker(AppPaths.Specialization),
        icon: RibbonStar20Filled,
        color: 'bg-secondary',
        permission: appPermissions.lmsSpecialization
      },
      {
        label: 'subjectPage.name',
        path: Utils.routeLmsPathMaker(AppPaths.Subject),
        icon: DocumentRibbon20Filled,
        color: 'bg-primary',
        permission: appPermissions.lmsSubjects
      },
      {
        label: 'eduPlanPage.name',
        path: Utils.routeLmsPathMaker(AppPaths.EduPlan),
        icon: CalendarLtr20Filled,
        color: 'bg-warning',
        permission: appPermissions.lmsEduPlan
      },
      {
        label: 'teacherPage.name',
        path: Utils.routeLmsPathMaker(AppPaths.Teacher),
        icon: ShareScreenPerson20Filled,
        color: 'bg-info',
        permission: appPermissions.lmsTeachers
      },
      {
        label: 'lessonPage.name',
        path: Utils.routeLmsPathMaker(AppPaths.Lesson),
        icon: AppsAddIn16Regular,
        color: 'bg-info',
        permission: appPermissions.lmsLessons
      },
      {
        label: 'teacherLesson.name',
        path: Utils.routeLmsPathMaker(AppPaths.TeacherLesson),
        icon: ShiftsCheckmark20Regular,
        color: 'bg-info',
        permission: appPermissions.admin
      },
      {
        label: 'listener.name',
        path: Utils.routeLmsPathMaker(AppPaths.Listener),
        icon: ShiftsCheckmark20Regular,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'resultPage.name',
        path: Utils.routeLmsPathMaker(AppPaths.Result),
        icon: AppsList24Filled,
        color: 'bg-info',
        permission: appPermissions.admin
      },
      {
        label: 'lmsCertificate.name',
        path: Utils.routeLmsPathMaker(AppPaths.Certificate),
        icon: Certificate24Filled,
        color: 'bg-info',
        permission: appPermissions.lmsCertificate
      }
    ]
  },
  {
    label: 'navigation.economist',
    path: AppPaths.Accountant,
    icon: PeopleMoney24Filled,
    permission: appPermissions.economist,
    children: [
      {
        label: 'accDashboard.name',
        path: Utils.routeAccountantPathMaker(AppPaths.Dashboard),
        icon: Grid20Filled,
        color: 'bg-dark',
        permission: appPermissions.economistDashboard
      },
      {
        label: 'salaryCategory.name',
        path: Utils.routeAccountantPathMaker(AppPaths.SalaryCategory),
        icon: AppTitle24Filled,
        color: 'bg-dark',
        permission: appPermissions.economistWorkerCategories
      },
      {
        label: 'uploadReport.name',
        path: Utils.routeAccountantPathMaker(AppPaths.UploadReport),
        icon: ArrowUpload16Filled,
        color: 'bg-success',
        permission: appPermissions.economistUploads
      },
      {
        label: 'monthReport.name',
        path: Utils.routeAccountantPathMaker(AppPaths.MonthReport),
        icon: Calculator24Regular,
        color: 'bg-warning',
        permission: appPermissions.economistStatements
      },
      {
        label: 'salaryReport.name',
        path: Utils.routeAccountantPathMaker(AppPaths.SalaryReport),
        icon: QrCode24Regular,
        color: 'bg-dark',
        permission: appPermissions.economistStatementsCode
      },
      {
        label: 'taxFour.name',
        path: Utils.routeAccountantPathMaker(AppPaths.TaxFour),
        icon: Calculator24Regular,
        color: 'bg-success',
        permission: appPermissions.economistTaxFour
      },
      {
        label: 'taxFive.name',
        path: Utils.routeAccountantPathMaker(AppPaths.TaxFive),
        icon: Calculator24Regular,
        color: 'bg-info',
        permission: appPermissions.economistTaxFive
      },
      {
        label: 'pensionPayment.name',
        path: Utils.routeAccountantPathMaker(AppPaths.PensionPayment),
        icon: Calculator24Regular,
        color: 'bg-success',
        permission: appPermissions.economistPensionPayments
      },
      {
        label: 'report.name',
        path: Utils.routeAccountantPathMaker(AppPaths.Report),
        icon: AppFolder20Filled,
        color: 'bg-info',
        permission: appPermissions.hrReport
      },
      {
        label: 'staffingApproval.name',
        path: Utils.routeAccountantPathMaker(AppPaths.Approval),
        icon: AppsList20Regular,
        color: 'bg-info',
        permission: appPermissions.economistStaffingApprove
      }
    ]
  },
  {
    label: 'navigation.hospital',
    path: AppPaths.Hospital,
    icon: BuildingHome16Filled,
    permission: appPermissions.hospital,
    children: [
      {
        label: 'expiredHealth.name',
        path: Utils.routeHospitalPathMaker(AppPaths.ExpiredHealth),
        icon: BriefcaseMedical20Filled,
        color: 'bg-warning',
        permission: appPermissions.hospitalExpired
      },
      {
        label: 'ticket.name',
        path: Utils.routeHospitalPathMaker(AppPaths.Ticket),
        icon: DocumentRibbon24Filled,
        color: 'bg-success',
        permission: appPermissions.hospitalTicket
      },
      {
        label: 'medWorker.name',
        path: Utils.routeHospitalPathMaker(AppPaths.MedWorker),
        icon: DocumentRibbon24Filled,
        color: 'bg-info',
        permission: appPermissions.hospitalTicket
      },
      {
        label: 'pensioner.name',
        path: Utils.routeHospitalPathMaker(AppPaths.Pensioner),
        icon: AppFolder24Filled,
        color: 'bg-info',
        permission: appPermissions.hospitalPensioner
      }
    ]
  },
  {
    label: 'navigation.admin',
    path: AppPaths.Admin,
    icon: LockClosed16Filled,
    permission: appPermissions.admin,
    children: [
      {
        label: 'userPage.name',
        path: Utils.routePathMaker(AppPaths.User),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.users
      },
      {
        label: 'userRole.name',
        path: Utils.routePathMaker(AppPaths.UserRole),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.roles
      },
      {
        label: 'userPermission.name',
        path: Utils.routePathMaker(AppPaths.UserPermission),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.permissions
      },
      {
        label: 'countryPage.name',
        path: Utils.routePathMaker(AppPaths.Country),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.countries
      },
      {
        label: 'regionPage.name',
        path: Utils.routePathMaker(AppPaths.Region),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.regions
      },
      {
        label: 'districtPage.name',
        path: Utils.routePathMaker(AppPaths.District),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.cities
      },
      {
        label: 'nationalityPage.name',
        path: Utils.routePathMaker(AppPaths.Nationality),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.nationalities
      },
      {
        label: 'positionPage.name',
        path: Utils.routePathMaker(AppPaths.Position),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.positions
      },
      {
        label: 'schedulePage.name',
        path: Utils.routePathMaker(AppPaths.Schedule),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.schedules
      },
      {
        label: 'workdayPage.name',
        path: Utils.routePathMaker(AppPaths.Workday),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.workDay
      },
      {
        label: 'organizationPage.name',
        path: Utils.routePathMaker(AppPaths.Organizations),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.organizations
      },
      {
        label: 'actionLog.name',
        path: Utils.routePathMaker(AppPaths.ActionLog),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.activityLogs
      },
      {
        label: 'documentSetting.name',
        path: Utils.routePathMaker(AppPaths.DocumentSetting),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.documentExamples
      },
      {
        label: 'holidayPage.name',
        path: Utils.routePathMaker(AppPaths.Holiday),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.holidays
      },
      {
        label: 'othersPage.name',
        path: Utils.routePathMaker(AppPaths.AdminOther),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.universities
      },
      {
        label: 'telegramPage.name',
        path: Utils.routePathMaker(AppPaths.Telegram),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.telegram
      },
      {
        label: 'learningCenterPage.name',
        path: Utils.routePathMaker(AppPaths.LearningCenter),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.learningCenters
      },
      {
        label: 'instructionPage.name',
        path: Utils.routePathMaker(AppPaths.Instruction),
        icon: Folder48Filled,
        color: 'bg-dark',
        permission: appPermissions.instructions
      }
    ]
  },
  {
    label: 'navigation.chat',
    path: AppPaths.Chat,
    icon: ChatMultiple16Filled,
    permission: appPermissions.admin,
    children: [
      {
        label: 'notificationPage.name',
        path: Utils.routeChatPathMaker(AppPaths.Notification),
        icon: CommentLightning20Filled,
        color: 'bg-dark',
        permission: appPermissions.instructions
      },
      {
        label: 'newsPage.name',
        path: Utils.routeChatPathMaker(AppPaths.News),
        icon: News24Regular,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'newsCategoryPage.name',
        path: Utils.routeChatPathMaker(AppPaths.NewsCategory),
        icon: Tag16Filled,
        color: 'bg-dark',
        permission: appPermissions.admin
      }
    ]
  }
]

export const otherNavigations = [
  {
    label: 'loginPage.name',
    path: AppPaths.Login,
    icon: 'bx bxs-user-circle'
  },
  {
    label: 'registerPage.name',
    path: AppPaths.Register,
    icon: 'bx bxs-user-circle'
  }
]
