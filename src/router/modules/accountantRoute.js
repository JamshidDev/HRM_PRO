import Utils from '@/utils/Utils.js'
import { AppLayouts, AppPaths } from '@/utils/index.js'

export const accountantRoutes = [
  {
    path: Utils.routeAccountantPathMaker(AppPaths.UploadReport),
    component: ()=> import("@/pages/accountant/report/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.MonthReport),
    component: ()=> import("@/pages/accountant/monthReport/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.TaxFour),
    component: ()=> import("@/pages/accountant/taxFour/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.TaxFive),
    component: ()=> import("@/pages/accountant/taxFive/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.Dashboard),
    component: ()=> import("@/pages/accountant/dashboard/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.SalaryCategory),
    component: ()=> import("@/pages/accountant/salaryCategory/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.SalaryReport),
    component: ()=> import("@/pages/accountant/salaryReport/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.PensionPayment),
    component: ()=> import("@/pages/accountant/pensionPayment/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.Report),
    component: import("@/pages/hrm/report/ReportPage.vue"),
    meta: {
      layout: AppLayouts.main
    }
  }
]
