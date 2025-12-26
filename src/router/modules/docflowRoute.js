import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'
import {
  ConfContractPage,
  ConfAddContractPage,
  ConfApplicationPage,
  ConfCommandPage,
  ConfTimeSheetPage
} from '@/pages/docFlow/index.js'

export const docFlowRoutes = [
  {
    path: Utils.routeDocFlowPathMaker(AppPaths.ConfContract),
    component: ConfContractPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeDocFlowPathMaker(AppPaths.ConfCommand),
    component: ConfCommandPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeDocFlowPathMaker(AppPaths.ConfAdContract),
    component: ConfAddContractPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeDocFlowPathMaker(AppPaths.ConfApplication),
    component: ConfApplicationPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeDocFlowPathMaker(AppPaths.TimeSheet),
    component: ConfTimeSheetPage,
    meta: {
      layout: AppLayouts.main
    }
  }
]
