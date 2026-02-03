import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

export const docFlowRoutes = [
  {
    path: Utils.routeDocFlowPathMaker(AppPaths.ConfContract),
    component:()=> import("@/pages/docFlow/confirmation/contract/ConfirmationContract.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeDocFlowPathMaker(AppPaths.ConfCommand),
    component:()=> import("@/pages/docFlow/confirmation/command/ConfirmCommand.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeDocFlowPathMaker(AppPaths.ConfAdContract),
    component:()=> import("@/pages/docFlow/confirmation/adContract/AdContractPage.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeDocFlowPathMaker(AppPaths.ConfApplication),
    component:()=> import("@/pages/docFlow/confirmation/application/ConfApplication.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeDocFlowPathMaker(AppPaths.TimeSheet),
    component:()=> import("@/pages/docFlow/confirmation/timesheet/TimeSheetPage.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeDocFlowPathMaker(AppPaths.VacationSchedule),
    component:()=> import("@/pages/docFlow/confirmation/vacationSchedule/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeDocFlowPathMaker(AppPaths.Certificate),
    component:()=> import("@/pages/docFlow/confirmation/certificate/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  }
]
