import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

export const chatRoutes = [
  {
    path: Utils.routeChatPathMaker(AppPaths.Notification),
    component: () => import('@pages/chat/notification/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeChatPathMaker(AppPaths.Congratulation),
    component: () => import('@pages/chat/congratulation/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  }
]
