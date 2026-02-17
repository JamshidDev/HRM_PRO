import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

import { NotificationPage } from '@pages/chat/index.js'
import { NewsPage, CreateNewsPage, ViewNewsPage } from '@pages/chat/news'

export const chatRoutes = [
  {
    path: Utils.routeChatPathMaker(AppPaths.Notification),
    component: NotificationPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeChatPathMaker(AppPaths.News),
    component: NewsPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeChatPathMaker(`${AppPaths.News}${AppPaths.Create}`),
    component: CreateNewsPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeChatPathMaker(`${AppPaths.News}/:id`),
    component: ViewNewsPage,
    meta: {
      layout: AppLayouts.main
    }
  }
]
