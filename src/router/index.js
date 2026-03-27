import { createRouter, createWebHistory } from 'vue-router'
import { AppLayouts, AppPaths, useAppSetting } from '@/utils/index.js'

import {
  adminRoutes,
  appRoutes,
  attestationRoutes,
  docFlowRoutes,
  hrmRoutes,
  othersRoutes,
  lmsRoutes,
  accountantRoutes,
  turnstileRoutes,
  hospitalRoutes,
  chatRoutes,
  extraRoutes,
} from '@/router/modules'

const beforeLogin = (to, from, next) => {
  const token = localStorage.getItem(useAppSetting.tokenKey)
  if (token) {
    next()
  } else {
    localStorage.removeItem(useAppSetting.tokenKey)
    next(AppPaths.Login)
  }
}

const routes = [
  ...appRoutes,
  {
    path: AppPaths.Main,
    beforeEnter: beforeLogin,
    redirect: AppPaths.Home,
    children: [
      {
        path: AppPaths.Admin,
        name: AppPaths.Admin.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: adminRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Hrm,
        name: AppPaths.Hrm.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: hrmRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Attestation,
        name: AppPaths.Attestation.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: attestationRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Turnstile,
        name: AppPaths.Turnstile.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: turnstileRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.DocFlow,
        name: AppPaths.DocFlow.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: docFlowRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Lms,
        name: AppPaths.Lms.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: lmsRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Others,
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: othersRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Accountant,
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: accountantRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Hospital,
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: hospitalRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Chat,
        name: AppPaths.Chat.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: chatRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Extra,
        name: AppPaths.Extra.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: extraRoutes,
        meta: {
          layout: AppLayouts.main
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router
