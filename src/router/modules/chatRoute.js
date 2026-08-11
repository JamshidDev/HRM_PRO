import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

import {
  NotificationPage,
  NewsPage,
  NewsFormPage,
  ViewNewsPage,
  NewsCategoryPage,
  CongratulationPage
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
  },
  {
    path: Utils.routeChatPathMaker(AppPaths.Congratulation),
    component: CongratulationPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeChatPathMaker(AppPaths.MobileStories),
    name: AppPaths.MobileStories.substring(1),
    component: () => import('@pages/admin/mobileStory/MobileStoryPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeChatPathMaker(`${AppPaths.MobileStories}/:id`),
    name: `${AppPaths.MobileStories.substring(1)}-form`,
    component: () => import('@pages/admin/mobileStory/MobileStoryFormPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  }
]
