import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

export const hrmRoutes = [
  {
    path: Utils.routeHrmPathMaker(AppPaths.Worker),
    name: AppPaths.Worker.substring(1),
    component: () => import('@/pages/hrm/worker/WorkerPage.vue'),
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
    path: Utils.routeHrmPathMaker(`${AppPaths.Worker}${AppPaths.Create}`),
    name: `${AppPaths.Worker.substring(1)}-${AppPaths.Create.substring(1)}`,
    component: () => import('@/pages/hrm/candidate/CandidatePage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Confirmation),
    name: AppPaths.Confirmation.substring(1),
    component: () => import('@/pages/hrm/confirmation/ConfirmationPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.WorkerProfile),
    name: AppPaths.WorkerProfile.substring(1),
    component: () => import('@/pages/hrm/workerProfile/ProfilePage.vue'),
    meta: { layout: AppLayouts.main }
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
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.OrganizationLeader),
    component: () => import('@/pages/hrm/organizationLeader/organizationLeaderPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Export),
    component: () => import('@/pages/hrm/export/exportPage.vue'),
    meta: { layout: AppLayouts.main }
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
    path: Utils.routeHrmPathMaker(AppPaths.WorkerRole),
    component: () => import('@/pages/hrm/UserRole/UserRolePage.vue'),
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
    path: Utils.routeHrmPathMaker(AppPaths.Report),
    component: () => import('@/pages/hrm/report/ReportPage.vue'),
    meta: { layout: AppLayouts.main }
  },
  {
    path: Utils.routeHrmPathMaker(AppPaths.Polyclinic),
    component: () => import('@/pages/hrm/polyclinic/page.vue'),
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
  }
]
