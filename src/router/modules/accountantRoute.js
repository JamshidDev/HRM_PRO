import Utils from '@/utils/Utils.js'
import { AppLayouts, AppPaths } from '@/utils/index.js'
import {
  UploadReportPage,
  MonthReportPage,
  TaxFourPage,
  TaxFivePage,
  DashboardPage,
  SalaryCategoryPage,
  SalaryReportPage,
  PensionPaymentPage
} from '@/pages/accountant/index.js'

export const accountantRoutes = [
  {
    path: Utils.routeAccountantPathMaker(AppPaths.UploadReport),
    component: UploadReportPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.MonthReport),
    component: MonthReportPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.TaxFour),
    component: TaxFourPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.TaxFive),
    component: TaxFivePage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.Dashboard),
    component: DashboardPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.SalaryCategory),
    component: SalaryCategoryPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.SalaryReport),
    component: SalaryReportPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAccountantPathMaker(AppPaths.PensionPayment),
    component: PensionPaymentPage,
    meta: {
      layout: AppLayouts.main
    }
  }
]
