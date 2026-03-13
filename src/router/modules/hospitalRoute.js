import Utils from '@/utils/Utils.js'
import { AppLayouts, AppPaths } from '@/utils/index.js'

export const hospitalRoutes = [
  {
    path: Utils.routeHospitalPathMaker(AppPaths.ExpiredHealth),
    component: () => import('@/pages/hospital/expiredHealth/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeHospitalPathMaker(AppPaths.Ticket),
    component: () => import('@/pages/hospital/ticket/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeHospitalPathMaker(AppPaths.MedWorker),
    component: () => import('@/pages/hospital/medWorker/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeHospitalPathMaker(AppPaths.Pensioner),
    component: () => import('@/pages/hospital/pensioner/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  }
]
