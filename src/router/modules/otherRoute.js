import { AppLayouts, AppPaths } from '@/utils/index.js'

export const othersRoutes = [
  {
    path: AppPaths.Info,
    component:()=> import('@pages/others/info/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  }
]
