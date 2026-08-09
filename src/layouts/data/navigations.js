import { AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'
import icons from '@assets/icons'
import HrSidebarIcon from '@assets/icons/HrManagement.svg'
import DocFlowSidebarIcon from '@assets/icons/DocumentFlow.svg'
import AttestationSidebarIcon from '@assets/icons/Attestation.svg'
import TurnstileSidebarIcon from '@assets/icons/TurnstileMenu.svg'
import GeneralSidebarIcon from '@assets/icons/General.svg'
import LmsSidebarIcon from '@assets/icons/LmsManagement.svg'
import EconomistSidebarIcon from '@assets/icons/Economist.svg'
import HospitalSidebarIcon from '@assets/icons/Hospital.svg'
import ChatSidebarIcon from '@assets/icons/Chat.svg'
import ExtraSidebarIcon from '@assets/icons/Extra.svg'
import AdminSidebarIcon from '@assets/icons/Admin.svg'
import DocFlowContractIcon from '@assets/icons/Contracts.svg'
import DocFlowCommandIcon from '@assets/icons/Orders.svg'
import DocFlowAdContractIcon from '@assets/icons/AdditionalAgreem.svg'
import DocFlowApplicationIcon from '@assets/icons/Applications.svg'
import DocFlowTimesheetIcon from '@assets/icons/Timesheets.svg'
import DocFlowVacationScheduleIcon from '@assets/icons/VacationSchedule.svg'
import DocFlowCertificateIcon from '@assets/icons/certificats.svg'
import DocFlowStaffingIcon from '@assets/icons/Staffing.svg'
import DocFlowReportIcon from '@assets/icons/Reports.svg'
import AttestationTopicIcon from '@assets/icons/Topics.svg'
import AttestationCategoryIcon from '@assets/icons/dashboard.svg'
import AttestationExamIcon from '@assets/icons/Exams.svg'
import AttestationResultIcon from '@assets/icons/Results.svg'
import TurnstileDashboardIcon from '@assets/icons/dashboard.svg'
import TurnstileAccessLevelsIcon from '@assets/icons/groups.svg'
import TurnstileOrgAccessLevelsIcon from '@assets/icons/Organizations.svg'
import TurnstileHcWorkersIcon from '@assets/icons/Employees.svg'
import TurnstileHcEventsIcon from '@assets/icons/Events.svg'
import TurnstileWorkerImageIcon from '@assets/icons/TelegramImages.svg'
import TurnstileDevicesIcon from '@assets/icons/Devices.svg'
import TurnstileOthersIcon from '@assets/icons/Additional.svg'
import TurnstileDutyScheduleIcon from '@assets/icons/DutySchedule.svg'
import TurnstileShiftTypeIcon from '@assets/icons/Shifts.svg'
import TurnstileShiftTypeGroupIcon from '@assets/icons/ShiftGroups.svg'
import TurnstileScheduleIcon from '@assets/icons/TurnstileSchedule.svg'
import TurnstileApproveIcon from '@assets/icons/sentEmployees.svg'
import LmsDirectionIcon from '@assets/icons/Directions.svg'
import LmsSpecializationIcon from '@assets/icons/Specializations.svg'
import LmsSubjectIcon from '@assets/icons/Subjects.svg'
import LmsEduPlanIcon from '@assets/icons/TrainingPlan.svg'
import LmsTeacherIcon from '@assets/icons/Teachers.svg'
import LmsLessonIcon from '@assets/icons/activities.svg'
import LmsTeacherLessonIcon from '@assets/icons/lessons.svg'
import LmsListenerIcon from '@assets/icons/Employees.svg'
import LmsResultIcon from '@assets/icons/lmsResults.svg'
import LmsCertificateIcon from '@assets/icons/Certificates.svg'
import EconomistPayrollFundIcon from '@assets/icons/PayrollFund.svg'
import EconomistUploadReportIcon from '@assets/icons/UploadReport.svg'
import EconomistMonthReportIcon from '@assets/icons/MonthlyReport.svg'
import EconomistSalaryReportIcon from '@assets/icons/MonthlyReportCode.svg'
import EconomistTaxFourIcon from '@assets/icons/INPSAppendix4.svg'
import EconomistTaxFiveIcon from '@assets/icons/INPSAppendix5.svg'
import EconomistPensionPaymentIcon from '@assets/icons/INPSpayments.svg'
import EconomistReportIcon from '@assets/icons/PlanvsActual.svg'
import EconomistStaffingApprovalIcon from '@assets/icons/Staffing.svg'
import HospitalExpiredHealthIcon from '@assets/icons/MedicalExamination.svg'
import HospitalTicketIcon from '@assets/icons/Tickets.svg'
import HospitalMedWorkerIcon from '@assets/icons/Employees.svg'
import HospitalPensionerIcon from '@assets/icons/Pensioners.svg'
import ChatNotificationIcon from '@assets/icons/Notifications.svg'
import ChatNewsIcon from '@assets/icons/News.svg'
import ChatMobileStoryIcon from '@assets/icons/StoryAnnouncements.svg'
import ChatNewsCategoryIcon from '@assets/icons/NewsCategories.svg'
import ChatCongratulationIcon from '@assets/icons/telegramMessages.svg'
import ExtraWorkerRoleIcon from '@assets/icons/Users.svg'
import ExtraEducationDirectoryIcon from '@assets/icons/EducationDirectory.svg'
import ExtraDepartmentLocationIcon from '@assets/icons/DepartmentLocation.svg'
import AdminFolderIcon from '@assets/icons/adminFolder.svg'
import {
  BookDatabase24Regular,
  Grid20Filled,
  RibbonStar24Filled
} from '@vicons/fluent'
const {
  usersIcon,
  menuIcon,
  department2Icon,
  positionIcon,
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
  punishmentIcon,
  planAndFactIcon,
  pensionaryIcon,
  qualificationIcon,
  reportIcon,
  reportRefreshIcon,
} = icons

import i18n from '@/i18n/index.js'
import { appPermissions } from '@/utils/index.js'

const { t } = i18n.global

export const navigations = [
  {
    label: 'navigation.hrm', // Kadrlar boshqaruvi
    path: AppPaths.Hrm,
    icon: HrSidebarIcon,
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
        permission: appPermissions.hrVacationSchedule
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
        icon: punishmentIcon,
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
        icon: planAndFactIcon,
        color: 'bg-info',
        permission: appPermissions.hrReport
      },
      {
        label: 'pensioner.name', // Pensionerlar
        path: Utils.routeHrmPathMaker(AppPaths.Pensioner),
        icon: pensionaryIcon,
        color: 'bg-info',
        permission: appPermissions.hrReport
      },
      {
        label: 'lmsWorkerPage.name', // Malaka oshirish
        path: Utils.routeHrmPathMaker(AppPaths.LmsWorker),
        icon: qualificationIcon,
        color: 'bg-success',
        permission: appPermissions.lmsWorker
      },
      {
        label: 'specialReport.name', // Hisobotlar
        path: Utils.routeHrmPathMaker(AppPaths.SpecialReport),
        icon: reportIcon,
        color: 'bg-info',
        permission: appPermissions.hrReportExport
      },
      {
        label: 'structureReport.name', // Hisobot aylanmasi
        path: Utils.routeHrmPathMaker(AppPaths.StructureReport),
        icon: reportRefreshIcon,
        color: 'bg-warning',
        permission: appPermissions.hrMonthlyReport
      }
    ]
  },
  {
    label: 'navigation.docFlow', // Hujjat aylanishi
    path: '/docflow',
    icon: DocFlowSidebarIcon,
    permission: appPermissions.confirmation,
    name: 'confirmation',
    children: [
      {
        label: 'confirmation.name', // Shartnomalar
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfContract),
        icon: DocFlowContractIcon,
        color: 'bg-dark',
        permission: appPermissions.confirmationContracts,
        name: 'contracts'
      },
      {
        label: 'documentPage.tabs.command', // Buyruqlar
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfCommand),
        icon: DocFlowCommandIcon,
        color: 'bg-primary',
        permission: appPermissions.confirmationCommands,
        name: 'commands'
      },
      {
        label: 'documentPage.tabs.adContract', // Qo'sh. kelishuv
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfAdContract),
        icon: DocFlowAdContractIcon,
        color: 'bg-warning',
        permission: appPermissions.confirmationAddContracts,
        name: 'contract-additional'
      },
      {
        label: 'applicationPage.name', // Arizalar
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfApplication),
        icon: DocFlowApplicationIcon,
        color: 'bg-info',
        permission: appPermissions.confirmationWorkerApplications,
        name: 'worker-application'
      },
      {
        label: 'timesheetPage.name', // Tabellar
        path: Utils.routeDocFlowPathMaker(AppPaths.TimeSheet),
        icon: DocFlowTimesheetIcon,
        color: 'bg-secondary',
        permission: appPermissions.confirmationTable
      },
      {
        label: 'vacationSchedule.name', // Ta'tillar grafigi
        path: Utils.routeDocFlowPathMaker(AppPaths.VacationSchedule),
        icon: DocFlowVacationScheduleIcon,
        color: 'bg-info',
        permission: appPermissions.hrVacationSchedule
      },
      {
        label: 'lmsCertificate.name', // Sertifikatlar
        path: Utils.routeDocFlowPathMaker(AppPaths.Certificate),
        icon: DocFlowCertificateIcon,
        color: 'bg-info',
        permission: appPermissions.confirmationLmsCertificate,
        name: 'lms-certificate'
      },
      {
        label: 'staffingApproval.name', // Shtatlar
        path: Utils.routeDocFlowPathMaker(AppPaths.Approval),
        icon: DocFlowStaffingIcon,
        color: 'bg-info',
        permission: appPermissions.confirmationStaffingApproval,
        name: 'staffing-approve'
      },
      {
        label: 'confirmationReport.name', // Hisobotlar
        path: Utils.routeDocFlowPathMaker(AppPaths.ConfReport),
        icon: DocFlowReportIcon,
        color: 'bg-warning',
        permission: appPermissions.confirmation,
        name: 'conf-report'
      }
    ]
  },
  {
    label: 'navigation.attestation', // Attestatsiya
    path: AppPaths.Attestation,
    icon: AttestationSidebarIcon,
    permission: appPermissions.exam,
    children: [
      {
        label: 'topicPage.name', // Mavzular
        path: Utils.routeAttestationPathMaker(AppPaths.Topic),
        icon: AttestationTopicIcon,
        color: 'bg-warning',
        permission: appPermissions.examTopics
      },
      {
        label: 'categoryPage.name', // Kategoriyalar
        path: Utils.routeAttestationPathMaker(AppPaths.Category),
        icon: AttestationCategoryIcon,
        color: 'bg-info',
        permission: appPermissions.examCategories
      },
      {
        label: t('examPage.name'), // Imtihonlar
        path: Utils.routeAttestationPathMaker(AppPaths.Exam),
        icon: AttestationExamIcon,
        color: 'bg-secondary',
        permission: appPermissions.examExams
      },
      {
        label: t('examPage.result'), // Natijalar
        path: Utils.routeAttestationPathMaker(AppPaths.Result),
        icon: AttestationResultIcon,
        color: 'bg-dark',
        permission: appPermissions.examResults
      }
    ]
  },
  {
    label: 'navigation.turnstile', // Turniket
    path: AppPaths.Turnstile,
    icon: TurnstileSidebarIcon,
    permission: appPermissions.turnstile,
    children: [
      {
        label: 'turnStileDashboard.name', // Dashboard
        path: Utils.routeTurnstilePathMaker(AppPaths.Dashboard),
        icon: TurnstileDashboardIcon,
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
        icon: TurnstileAccessLevelsIcon,
        color: 'bg-info',
        permission: appPermissions.turnstileAccessLevels
      },
      {
        label: 'turnstile.orgAccessLevelsPage.name', // Tashkilot va guruhlar
        path: Utils.routeTurnstilePathMaker(AppPaths.OrgAccessLevels),
        icon: TurnstileOrgAccessLevelsIcon,
        color: 'bg-secondary',
        permission: appPermissions.turnstileOrganizationAccessLevels
      },
      {
        label: 'turnstile.hcWorkersPage.name', // Xodimlar
        path: Utils.routeTurnstilePathMaker(AppPaths.HcWorkers),
        icon: TurnstileHcWorkersIcon,
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
        icon: TurnstileHcEventsIcon,
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
        icon: TurnstileWorkerImageIcon,
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
        icon: TurnstileDevicesIcon,
        color: 'bg-info',
        permission: appPermissions.turnstileDevices
      },
      {
        label: 'additionalPage.name', // Qo'shimcha
        path: Utils.routeTurnstilePathMaker(AppPaths.Others),
        icon: TurnstileOthersIcon,
        color: 'bg-primary',
        permission: appPermissions.turnstileOthers
      },
      {
        label: 'schedule.name', // Navbatchilik grafigi
        path: Utils.routeTurnstilePathMaker(AppPaths.Schedule),
        icon: TurnstileDutyScheduleIcon,
        color: 'bg-dark',
        permission: appPermissions.turnstileSheets
      },
      {
        label: 'shiftType.name', // Smenalar
        path: Utils.routeTurnstilePathMaker(AppPaths.ShiftType),
        icon: TurnstileShiftTypeIcon,
        color: 'bg-dark',
        permission: appPermissions.turnstileSheetsWorkers
      },
      {
        label: 'shiftType.groupName', // Smena guruhlari
        path: Utils.routeTurnstilePathMaker(AppPaths.ShiftTypeGroup),
        icon: TurnstileShiftTypeGroupIcon,
        color: 'bg-dark',
        permission: appPermissions.turnstileSheetsGroups
      },
      {
        label: 'turnstileSchedule.name', // Turniket grafiki
        path: Utils.routeTurnstilePathMaker(AppPaths.TurnstileSchedule),
        icon: TurnstileScheduleIcon,
        color: 'bg-dark',
        permission: appPermissions.turnstileSheets
      },
      {
        label: 'approve.name', // Yuborilgan xodimlar
        path: Utils.routeTurnstilePathMaker(AppPaths.Approve),
        icon: TurnstileApproveIcon,
        color: 'bg-success',
        permission: appPermissions.turnstileApprove
      }
    ]
  },
  {
    label: 'navigation.general', // Umumiy
    path: AppPaths.Info,
    icon: GeneralSidebarIcon,
    permission: appPermissions.useful,
    children: []
  },
  {
    label: 'navigation.lms', // O'quv boshqaruvi
    path: AppPaths.Lms,
    icon: LmsSidebarIcon,
    permission: appPermissions.lms,
    children: [
      {
        label: 'directionPage.name', // Yo'nalishlar
        path: Utils.routeLmsPathMaker(AppPaths.Direction),
        icon: LmsDirectionIcon,
        color: 'bg-dark',
        permission: appPermissions.lmsDirection
      },
      {
        label: 'specializationPage.name', // Ixtisosliklar
        path: Utils.routeLmsPathMaker(AppPaths.Specialization),
        icon: LmsSpecializationIcon,
        color: 'bg-secondary',
        permission: appPermissions.lmsSpecialization
      },
      {
        label: 'subjectPage.name', // Fanlar (modullar)
        path: Utils.routeLmsPathMaker(AppPaths.Subject),
        icon: LmsSubjectIcon,
        color: 'bg-primary',
        permission: appPermissions.lmsSubjects
      },
      {
        label: 'eduPlanPage.name', // O'quv rejasi
        path: Utils.routeLmsPathMaker(AppPaths.EduPlan),
        icon: LmsEduPlanIcon,
        color: 'bg-warning',
        permission: appPermissions.lmsEduPlan
      },
      {
        label: 'teacherPage.name', // Pedagoglar
        path: Utils.routeLmsPathMaker(AppPaths.Teacher),
        icon: LmsTeacherIcon,
        color: 'bg-info',
        permission: appPermissions.lmsTeachers
      },
      {
        label: 'lessonPage.name', // Mashg'ulotlar
        path: Utils.routeLmsPathMaker(AppPaths.Lesson),
        icon: LmsLessonIcon,
        color: 'bg-info',
        permission: appPermissions.lmsLessons
      },
      {
        label: 'teacherLesson.name', // Darslar
        path: Utils.routeLmsPathMaker(AppPaths.TeacherLesson),
        icon: LmsTeacherLessonIcon,
        color: 'bg-info',
        permission: appPermissions.lmsLessons
      },
      {
        label: 'listener.name', // Tinglovchilar
        path: Utils.routeLmsPathMaker(AppPaths.Listener),
        icon: LmsListenerIcon,
        color: 'bg-dark',
        permission: appPermissions.lms
      },
      {
        label: 'resultPage.name', // Natijalar
        path: Utils.routeLmsPathMaker(AppPaths.Result),
        icon: LmsResultIcon,
        color: 'bg-info',
        permission: appPermissions.lms
      },
      {
        label: 'lmsCertificate.name', // Sertifikatlar
        path: Utils.routeLmsPathMaker(AppPaths.Certificate),
        icon: LmsCertificateIcon,
        color: 'bg-info',
        permission: appPermissions.lmsCertificate
      }
    ]
  },
  {
    label: 'navigation.economist', // Iqtisodchi
    path: AppPaths.Accountant,
    icon: EconomistSidebarIcon,
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
        icon: EconomistPayrollFundIcon,
        color: 'bg-dark',
        permission: appPermissions.economistWorkerCategories
      },
      {
        label: 'uploadReport.name', // Hisobot yuklash
        path: Utils.routeAccountantPathMaker(AppPaths.UploadReport),
        icon: EconomistUploadReportIcon,
        color: 'bg-success',
        permission: appPermissions.economistUploads
      },
      {
        label: 'monthReport.name', // Oylik hisobot
        path: Utils.routeAccountantPathMaker(AppPaths.MonthReport),
        icon: EconomistMonthReportIcon,
        color: 'bg-warning',
        permission: appPermissions.economistStatements
      },
      {
        label: 'salaryReport.name', // Oylik hisobot (shifr)
        path: Utils.routeAccountantPathMaker(AppPaths.SalaryReport),
        icon: EconomistSalaryReportIcon,
        color: 'bg-dark',
        permission: appPermissions.economistStatementsCode
      },
      {
        label: 'taxFour.name', // JSHDS 4-ilova
        path: Utils.routeAccountantPathMaker(AppPaths.TaxFour),
        icon: EconomistTaxFourIcon,
        color: 'bg-success',
        permission: appPermissions.economistTaxFour
      },
      {
        label: 'taxFive.name', // JSHDS 5-ilova
        path: Utils.routeAccountantPathMaker(AppPaths.TaxFive),
        icon: EconomistTaxFiveIcon,
        color: 'bg-info',
        permission: appPermissions.economistTaxFive
      },
      {
        label: 'pensionPayment.name', // SHJPH (INPS) to'lov
        path: Utils.routeAccountantPathMaker(AppPaths.PensionPayment),
        icon: EconomistPensionPaymentIcon,
        color: 'bg-success',
        permission: appPermissions.economistPensionPayments
      },
      {
        label: 'report.name', // Plan va Fakt
        path: Utils.routeAccountantPathMaker(AppPaths.Report),
        icon: EconomistReportIcon,
        color: 'bg-info',
        permission: appPermissions.hrReport
      },
      {
        label: 'staffingApproval.name', // Shtatlar
        path: Utils.routeAccountantPathMaker(AppPaths.Approval),
        icon: EconomistStaffingApprovalIcon,
        color: 'bg-info',
        permission: appPermissions.economistStaffingApprove
      }
    ]
  },
  {
    label: 'navigation.hospital', // Kasalxona
    path: AppPaths.Hospital,
    icon: HospitalSidebarIcon,
    permission: appPermissions.hospital,
    children: [
      {
        label: 'expiredHealth.name', // Tibbiy ko'rik
        path: Utils.routeHospitalPathMaker(AppPaths.ExpiredHealth),
        icon: HospitalExpiredHealthIcon,
        color: 'bg-warning',
        permission: appPermissions.hospitalExpired
      },
      {
        label: 'ticket.name', // Yo'llanmalar
        path: Utils.routeHospitalPathMaker(AppPaths.Ticket),
        icon: HospitalTicketIcon,
        color: 'bg-success',
        permission: appPermissions.hospitalTicket
      },
      {
        label: 'medWorker.name', // Barcha xodimlar
        path: Utils.routeHospitalPathMaker(AppPaths.MedWorker),
        icon: HospitalMedWorkerIcon,
        color: 'bg-info',
        permission: appPermissions.hospitalTicket
      },
      {
        label: 'pensioner.name', // Pensionerlar
        path: Utils.routeHospitalPathMaker(AppPaths.Pensioner),
        icon: HospitalPensionerIcon,
        color: 'bg-info',
        permission: appPermissions.hospitalPensioner
      }
    ]
  },
  {
    label: 'navigation.chat', // Chat
    path: AppPaths.Chat,
    icon: ChatSidebarIcon,
    permission: appPermissions.chat,
    children: [
      {
        label: 'notificationPage.name', // Bildirishnomalar
        path: Utils.routeChatPathMaker(AppPaths.Notification),
        icon: ChatNotificationIcon,
        color: 'bg-dark',
        permission: appPermissions.instructions
      },
      {
        label: 'newsPage.name', // Yangiliklar
        path: Utils.routeChatPathMaker(AppPaths.News),
        icon: ChatNewsIcon,
        color: 'bg-dark',
        permission: appPermissions.chat
      },
      {
        label: 'mobileStoryPage.name',
        path: Utils.routePathMaker(AppPaths.MobileStories),
        icon: ChatMobileStoryIcon,
        color: 'bg-dark',
        permission: appPermissions.chat
      },
      {
        label: 'newsCategoryPage.name', // Yangilik kategoriyalari
        path: Utils.routeChatPathMaker(AppPaths.NewsCategory),
        icon: ChatNewsCategoryIcon,
        color: 'bg-dark',
        permission: appPermissions.chat
      },
      {
        label: 'congratulation.name', // Telegram xabarlar
        path: Utils.routeChatPathMaker(AppPaths.Congratulation),
        icon: ChatCongratulationIcon,
        color: 'bg-warning',
        permission: appPermissions.chatTelegramMessages
      }
    ]
  },
  {
    label: 'navigation.extra', // Qo'shimchalar
    path: AppPaths.Extra,
    icon: ExtraSidebarIcon,
    permission: appPermissions.extra,
    children: [
      {
        label: 'workerRole.name', // Foydalanuvchilar
        path: Utils.routeExtraPathMaker(AppPaths.WorkerRole),
        icon: ExtraWorkerRoleIcon,
        color: 'bg-primary',
        // Backend real ruxsat = hr-users (route /extra/users, @Permission('hr-users-*')).
        // extra-worker-user o'lik slug edi — canView(hr-users) endi -read bilan tekshiradi.
        permission: appPermissions.hrUsers
      },
      {
        label: 'educationDirectory.name', // Ta'lim katalogi
        path: Utils.routeExtraPathMaker(AppPaths.AdminOther),
        icon: ExtraEducationDirectoryIcon,
        color: 'bg-dark',
        permission: appPermissions.educationsStructureMenu
      },
      {
        label: 'departmentLocationPage.name', // Bo'lim joylashuvi
        path: Utils.routeExtraPathMaker(AppPaths.DepartmentLocation),
        icon: ExtraDepartmentLocationIcon,
        color: 'bg-info',
        permission: appPermissions.departmentLocation
      }
    ]
  },
  {
    label: 'navigation.admin', // Admin
    path: AppPaths.Admin,
    icon: AdminSidebarIcon,
    permission: appPermissions.admin,
    children: [
      {
        label: 'userPage.name', // Foydalanuvchilar
        path: Utils.routePathMaker(AppPaths.User),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.users
      },
      {
        label: 'userRole.name', // Rollar
        path: Utils.routePathMaker(AppPaths.UserRole),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.roles
      },
      {
        label: 'userPermission.name', // Huquqlar
        path: Utils.routePathMaker(AppPaths.UserPermission),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.permissions
      },
      {
        label: 'countryPage.name', // Davlatlar
        path: Utils.routePathMaker(AppPaths.Country),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.countries
      },
      {
        label: 'regionPage.name', // Viloyatlar
        path: Utils.routePathMaker(AppPaths.Region),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.regions
      },
      {
        label: 'districtPage.name', // Tumanlar
        path: Utils.routePathMaker(AppPaths.District),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.cities
      },
      {
        label: 'nationalityPage.name', // Millatlar
        path: Utils.routePathMaker(AppPaths.Nationality),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.nationalities
      },
      {
        label: 'positionPage.name', // Lavozimlar
        path: Utils.routePathMaker(AppPaths.Position),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.positions
      },
      {
        label: 'schedulePage.name', // Ish jadvali
        path: Utils.routePathMaker(AppPaths.Schedule),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.schedules
      },
      {
        label: 'workdayPage.name', // Ish kunlari
        path: Utils.routePathMaker(AppPaths.Workday),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.workDay
      },
      {
        label: 'organizationPage.name', // Tashkilotlar
        path: Utils.routePathMaker(AppPaths.Organizations),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.organizations
      },
      {
        label: 'actionLog.name', // Amallar tarixi
        path: Utils.routePathMaker(AppPaths.ActionLog),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.activityLogs
      },
      {
        label: 'documentSetting.name', // Hujjat sozlamalari
        path: Utils.routePathMaker(AppPaths.DocumentSetting),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.documentExamples
      },
      {
        label: 'holidayPage.name', // Bayram kunlari
        path: Utils.routePathMaker(AppPaths.Holiday),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.holidays
      },
      {
        label: 'othersPage.name', // Boshqalar
        path: Utils.routePathMaker(AppPaths.AdminOther),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.universities
      },
      {
        label: 'telegramPage.name', // Telegram
        path: Utils.routePathMaker(AppPaths.Telegram),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.telegram
      },
      {
        label: 'learningCenterPage.name', // O'quv markazlari
        path: Utils.routePathMaker(AppPaths.LearningCenter),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.learningCenters
      },
      {
        label: 'instructionPage.name', // Instruksiya
        path: Utils.routePathMaker(AppPaths.Instruction),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.instructions
      },
      {
        label: 'mobileUserPage.name', // Mobil foydalanuvchilar
        path: Utils.routePathMaker(AppPaths.MobileUsers),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.mobileUsers
      },
      {
        label: 'vacancyApprovePage.menuName', // Tasdiqlash
        path: Utils.routePathMaker(AppPaths.VacancyApprove),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'integrationClients.name', // Integratsiya clientlari
        path: Utils.routePathMaker(AppPaths.IntegrationClients),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.integrationClients
      },
      {
        label: 'workerReport.name', // Xodim hisobotlari
        path: Utils.routePathMaker(AppPaths.WorkerReport),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.admin
      },
      {
        label: 'holidayGreetingPage.name', // Bayramlar
        path: Utils.routePathMaker(AppPaths.HolidayGreeting),
        icon: AdminFolderIcon,
        color: 'bg-dark',
        permission: appPermissions.holidayGreetings
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
