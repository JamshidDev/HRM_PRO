import { AppLayouts, AppPaths } from '@/utils/index.js'

export const appRoutes = [
  {
    path: AppPaths.DocumentViewer + '/:status',
    name: AppPaths.DocumentViewer.substring(1),
    component: () => import('@/pages/app/documentSignature/DocumentSignature.vue'),
    meta: {
      layout: AppLayouts.empty
    }
  },
  {
    path: AppPaths.Profile,
    name: AppPaths.Profile.substring(1),
    component: () => import('@/pages/app/profile/ProfilePage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: AppPaths.Home,
    name: AppPaths.Home.substring(1),
    component: () => import('@/pages/app/home/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: AppPaths.AIConversation,
    name: AppPaths.AIConversation.substring(1),
    component: () => import('@/pages/app/ai/AIConversationPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: AppPaths.Login,
    name: AppPaths.Login.substring(1),
    component: () => import('@/pages/app/loginnew/page.vue'),
    meta: {
      layout: AppLayouts.empty
    }
  },
  {
    path: '/public/:model/:key',
    name: 'public-page',
    component: () => import('@/pages/app/public/page.vue'),
    meta: {
      layout: AppLayouts.empty
    }
  },
  {
    path: AppPaths.PrivacyPolicy,
    name: 'privacy-policy',
    component: () => import('@/pages/app/privacyPolicy/PrivacyPolicyPage.vue'),
    meta: {
      layout: AppLayouts.empty
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/app/notFound/page.vue'),
    meta: {
      layout: AppLayouts.empty
    }
  }
]
