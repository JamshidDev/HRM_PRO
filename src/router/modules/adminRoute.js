import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

export const adminRoutes = [
  {
    path: Utils.routePathMaker(AppPaths.UserPermission),
    name: AppPaths.UserPermission.substring(1),
    component: () => import('@/pages/admin/permission/PermissionPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.User),
    name: AppPaths.User.substring(1),
    component: () => import('@/pages/admin/user/UserPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.UserRole),
    name: AppPaths.UserRole.substring(1),
    component: () => import('@/pages/admin/role/RolePage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.Country),
    name: AppPaths.Country.substring(1),
    component: () => import('@/pages/admin/country/CountryPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.Region),
    name: AppPaths.Region.substring(1),
    component: () => import('@/pages/admin/region/RegionPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.District),
    name: AppPaths.District.substring(1),
    component: () => import('@/pages/admin/district/DistrictPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.Nationality),
    name: AppPaths.Nationality.substring(1),
    component: () => import('@/pages/admin/nationality/NationalityPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.Position),
    name: AppPaths.Position.substring(1),
    component: () => import('@/pages/admin/position/PositionPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.Organizations),
    name: AppPaths.Organizations.substring(1),
    component: () => import('@/pages/admin/organization/OrganizationPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.ActionLog),
    name: AppPaths.ActionLog.substring(1),
    component: () => import('@/pages/admin/actionLog/ActionLogPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.DocumentSetting),
    name: AppPaths.DocumentSetting.substring(1),
    component: () => import('@/pages/admin/document/DocumentTemplate.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.AdminOther),
    name: AppPaths.AdminOther.substring(1),
    component: () => import('@/pages/admin/others/OthersPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.Schedule),
    name: AppPaths.Schedule.substring(1),
    component: () => import('@/pages/admin/schedule/SchedulePage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.Workday),
    name: AppPaths.Workday.substring(1),
    component: () => import('@/pages/admin/workday/WorkdayPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.Holiday),
    name: AppPaths.Holiday.substring(1),
    component: () => import('@/pages/admin/holiday/HolidayPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.Telegram),
    component: () => import('@/pages/admin/telegram/TelegramPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.LearningCenter),
    name: AppPaths.LearningCenter.substring(1),
    component: () => import('@/pages/admin/learningCenter/LearningCenterPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.Instruction),
    name: AppPaths.Instruction.substring(1),
    component: () => import('@/pages/admin/instruction/InstructionPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.MobileUsers),
    name: AppPaths.MobileUsers.substring(1),
    component: () => import('@pages/admin/mobileUser/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.VacancyApprove),
    name: AppPaths.VacancyApprove.substring(1),
    component: () => import('@/pages/admin/vacancyApprove/VacancyApprovePage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.IntegrationLog),
    name: AppPaths.IntegrationLog.substring(1),
    component: () => import('@pages/admin/integrationLog/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.IntegrationClients),
    name: AppPaths.IntegrationClients.substring(1),
    component: () => import('@pages/admin/integrationClients/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routePathMaker(AppPaths.LateWorkersReport),
    name: AppPaths.LateWorkersReport.substring(1),
    component: () => import('@pages/admin/lateWorkersReport/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  }
]
