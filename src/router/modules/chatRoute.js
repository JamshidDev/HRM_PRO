import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

import {
  NotificationPage,
  NewsPage,
  NewsFormPage,
  ViewNewsPage,
  NewsCategoryPage
} from '@pages/chat/index.js'

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
    path: Utils.routeChatPathMaker(`${AppPaths.News}/:id`),
    component: NewsFormPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeChatPathMaker(`${AppPaths.News}${AppPaths.View}/:id`),
    component: ViewNewsPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeChatPathMaker(AppPaths.NewsCategory),
    component: NewsCategoryPage,
    meta: {
      layout: AppLayouts.main
    }
  }
]
