import { AppLayouts, AppPaths, appPermissions } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

export const hrmRoutes = [
  {
    path: Utils.routeHrmPathMaker(AppPaths.Worker),
    name: AppPaths.Worker.substring(1),
    component: () => import('@/pages/hrm/worker/WorkerPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Archive),
    name: AppPaths.Archive.substring(1),
    component: () => import('@/pages/hrm/archive/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Department),
    name: AppPaths.Department.substring(1),
    component: () => import('@/pages/hrm/department/DepartmentPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.DepartmentPosition),
    name: AppPaths.DepartmentPosition.substring(1),
    component: () => import('@/pages/hrm/departmentPosition/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Kpi),
    name: AppPaths.Kpi.substring(1),
    component: () => import('@/pages/hrm/kpi/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.WorkerCertificate),
    name: AppPaths.WorkerCertificate.substring(1),
    component: () => import('@/pages/hrm/workerCertificate/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(`${AppPaths.Worker}${AppPaths.Create}`),
    name: `${AppPaths.Worker.substring(1)}-${AppPaths.Create.substring(1)}`,
    component: () => import('@/pages/hrm/candidate/CandidatePage.vue'),
    // Navigatsiyada bandi yo'q — otadan faqat `hr` meros bo'lardi. Yangi xodim
    // yaratish sahifasi bo'lgani uchun aniq write ruxsati talab qilinadi.
    meta: { layout: AppLayouts.main, permission: appPermissions.hrWorkersWrite }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Confirmation),
    name: AppPaths.Confirmation.substring(1),
    component: () => import('@/pages/hrm/confirmation/ConfirmationPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    // «Hisobotlar» — Plan va Fakt/Pensionerlar/Maxsus hisobot/Hisobot aylanmasi/Arxiv
    // boblari. Ruxsat massiv: kamida bitta bob ochiq bo'lsa sahifa ham ochiladi.
    path: Utils.routeHrmPathMaker(AppPaths.Reports),
    name: AppPaths.Reports.substring(1),
    component: () => import('@/pages/hrm/reports/page.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: [
        appPermissions.hrReportRead,
        appPermissions.hrReportExport,
        appPermissions.hrMonthlyReport,
        appPermissions.hrArchiveRead,
        appPermissions.hrCertificatesRead,
        appPermissions.hrDocumentsRead
      ]
    }
  },
  {
    // «Ta'til va intizom» — Ta'til/Grafik/Jazolar/Rag'batlar boblari. Ruxsat massiv:
    // kamida bitta bob ochiq bo'lsa sahifa ham ochiladi.
    path: Utils.routeHrmPathMaker(AppPaths.VacationDiscipline),
    name: AppPaths.VacationDiscipline.substring(1),
    component: () => import('@/pages/hrm/vacationDiscipline/page.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: [
        appPermissions.hrVacationsRead,
        appPermissions.hrVacationScheduleRead,
        appPermissions.hrPunishmentRead,
        appPermissions.hrIncentivesRead,
        appPermissions.hrBusinessTripRead
      ]
    }
  },
  {
    // «Hujjatlar» — Shartnoma/Buyruq/Qo'sh. kelishuv/Ariza tablari. Ruxsat massiv:
    // kamida bitta bob ochiq bo'lsa sahifa ham ochiladi.
    path: Utils.routeHrmPathMaker(AppPaths.Documents),
    name: AppPaths.Documents.substring(1),
    component: () => import('@/pages/docFlow/document/DocumentsPage.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: [
        appPermissions.hrContractsRead,
        appPermissions.hrCommandsRead,
        appPermissions.hrContractAdditionalRead,
        appPermissions.hrWorkerApplicationsRead,
        appPermissions.hrTableRead
      ]
    }
  },
  {
    // «Mas'ul xodimlar» — uchta reestr tab bo'lib turadi. Ruxsat massiv:
    // kamida bitta tab ochiq bo'lsa sahifa ham ochiladi.
    path: Utils.routeHrmPathMaker(AppPaths.Responsible),
    name: AppPaths.Responsible.substring(1),
    component: () => import('@/pages/hrm/responsible/page.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: [
        appPermissions.hrConfirmationsRead,
        appPermissions.hrLeadersRead,
        appPermissions.hrTableWorkersRead
      ]
    }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.WorkerProfile),
    name: AppPaths.WorkerProfile.substring(1),
    component: () => import('@/pages/hrm/workerProfile/ProfilePage.vue'),
    // Xodim kartochkasi — Xodimlar ro'yxatining detal ko'rinishi.
    meta: { layout: AppLayouts.main, permission: appPermissions.hrWorkersRead }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Application),
    name: AppPaths.Application.substring(1),
    component: () => import('@pages/docFlow/document/application/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Command),
    name: AppPaths.Command.substring(1),
    component: () => import('@/pages/docFlow/document/command/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.AdContract),
    name: AppPaths.AdContract.substring(1),
    component: () => import('@pages/docFlow/document/adContract/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Contract),
    name: AppPaths.Contract.substring(1),
    component: () => import('@/pages/docFlow/document/contract/ContractPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Vacation),
    name: AppPaths.Vacation.substring(1),
    component: () => import('@/pages/hrm/vacation/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Dashboard),
    name: AppPaths.Dashboard.substring(1),
    component: () => import('@/pages/hrm/dashboard/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.TimesheetDepartment),
    name: AppPaths.TimesheetDepartment.substring(1),
    component: () => import('@/pages/hrm/timesheetDepartment/TimesheetDepartmentPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.TimeSheet),
    name: AppPaths.TimeSheet.substring(1),
    component: () => import('@/pages/hrm/timesheet/TimesheetList.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Med),
    name: AppPaths.Med.substring(1),
    component: () => import('@/pages/hrm/med/MedPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Slice),
    name: AppPaths.Slice.substring(1),
    component: () => import('@/pages/hrm/slice/SlicePage.vue'),
    // Navigatsiyada bandi izohga olingan, lekin route tirik — sahifaning o'z
    // tekshiruvi (`hrJobsRead`) bilan bir xil slug'ga bog'lanadi.
    meta: { layout: AppLayouts.main, permission: appPermissions.hrJobsRead }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.OrganizationLeader),
    component: () => import('@/pages/hrm/organizationLeader/organizationLeaderPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Export),
    component: () => import('@/pages/hrm/export/exportPage.vue'),
    // Navigatsiyada bandi izohga olingan, lekin route tirik.
    meta: { layout: AppLayouts.main, permission: appPermissions.hrExport }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.BusinessTrip),
    component: () => import('@/pages/hrm/businessTrip/BusinessTripPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.DocumentArchive),
    component: () => import('@/pages/hrm/documentArchive/DocumentArchivePage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.VacationSchedule),
    component: () => import('@/pages/hrm/vacationSchedule/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Punishment),
    component: () => import('@/pages/hrm/punishment/PunishmentPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Incentive),
    component: () => import('@/pages/hrm/incentive/IncentivePage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Task),
    component: () => import('@/pages/hrm/task/TaskPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Report),
    component: () => import('@/pages/hrm/report/ReportPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.PublicVacancy),
    component: () => import('@/pages/hrm/vacancy/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Pensioner),
    component: () => import('@/pages/hrm/pensioner/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.LmsWorker),
    component: () => import('@/pages/lms/Worker/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Other),
    name: AppPaths.Other.substring(1),
    component: () => import('@/pages/hrm/other/page.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.SpecialReport),
    name: AppPaths.SpecialReport.substring(1),
    component: () => import('@/pages/hrm/specialReport/SpecialReportPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.StructureReport),
    name: AppPaths.StructureReport.substring(1),
    component: () => import('@/pages/hrm/structureReport/page.vue'),
    meta: { layout: AppLayouts.main }
  }
]
