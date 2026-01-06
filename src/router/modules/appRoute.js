import { AppLayouts, AppPaths } from '@/utils/index.js'

import {
  HomePage,
  NotFoundPage,
  DocumentSignature,
  LoginPageV2,
  AIConversationPage,
  PublicPage
} from '@/pages/app/index.js'

export const appRoutes = [
  {
    path: AppPaths.DocumentViewer + '/:status',
    name: AppPaths.DocumentViewer.substring(1),
    component: DocumentSignature,
    meta: {
      layout: AppLayouts.empty
    }
  },
  {
    path: AppPaths.Home,
    name: AppPaths.Home.substring(1),
    component: HomePage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: AppPaths.AIConversation,
    name: AppPaths.AIConversation.substring(1),
    component: AIConversationPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: AppPaths.Login,
    name: AppPaths.Login.substring(1),
    component: LoginPageV2,
    meta: {
      layout: AppLayouts.empty
    }
  },
  {
    path: '/public/:model/:key',
    name: 'public-page',
    component: PublicPage,
    meta: {
      layout: AppLayouts.empty
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage,
    meta: {
      layout: AppLayouts.empty
    }
  }
]
