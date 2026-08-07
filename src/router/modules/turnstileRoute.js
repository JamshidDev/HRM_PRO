import { AppLayouts, AppPaths, appPermissions } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

// DIQQAT: quyidagi bir necha route'ning navigations.js dagi bandi izohga olingan,
// lekin route'larning o'zi tirik. Ular `meta.permission`siz qolsa faqat modul
// darajasida (`turnstile`) yopilardi — shuning uchun har biriga sahifaning o'z
// tekshiruvi bilan mos aniq slug biriktirilgan.
export const turnstileRoutes = [
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.Building),
    component: () => import('@turnstile/building/page.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: appPermissions.turnstileBuilding
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.Terminal),
    component: () => import('@turnstile/terminal/page.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: appPermissions.turnstileTerminal
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.Organizations),
    component: () => import('@turnstile/organizationTerminal/page.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: appPermissions.turnstileOrganization
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.User),
    component: () => import('@turnstile/terminalUser/page.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: appPermissions.turnstileWorkers
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.WorkDuration),
    component: () => import('@turnstile/workDuration/page.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: appPermissions.turnstileWorkDuration
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.AccessLevels),
    component: () => import('@turnstile/accessLevels/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.OrgAccessLevels),
    component: () => import('@turnstile/orgAccessLevels/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.HcWorkers),
    component: () => import('@turnstile/hcWorkers/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.HcServer),
    component: () => import('@turnstile/hcServer/page.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: appPermissions.turnstileHikCentralJob
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.HcEvents),
    component: () => import('@turnstile/events/ui/Tabs.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.HcEventsV2),
    component: () => import('@turnstile/eventsV2/page.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: appPermissions.turnstileHikCentralEvents
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.WorkerImage),
    component: () => import('@turnstile/workerImage/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.SyncLog),
    component: () => import('@turnstile/syncLog/page.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: appPermissions.turnstileHikCentralSync
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.Dashboard),
    component: () => import('@turnstile/dashboard/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.HCWorkDuration),
    component: () => import('@turnstile/HKWorkDuration/page.vue'),
    meta: {
      layout: AppLayouts.main,
      permission: appPermissions.turnstileHcpDuration
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.Others),
    component: () => import('@turnstile/others/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.Devices),
    component: () => import('@turnstile/devices/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.Schedule),
    component: () => import('@turnstile/schedule/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.ShiftType),
    component: () => import('@turnstile/shiftType/ui/Tabs.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.ShiftTypeGroup),
    component: () => import('@turnstile/shiftType/ui/Tabs.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.TurnstileSchedule),
    component: () => import('@turnstile/turnstileSchedule/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeTurnstilePathMaker(AppPaths.Approve),
    component: () => import('@turnstile/approve/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  }
]
