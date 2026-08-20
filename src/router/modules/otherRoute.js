import { AppLayouts, AppPaths } from '@/utils/index.js'

export const othersRoutes = [
  {
    // O'zgarishlar tarixi — BITTA global sahifa. Har CRUD page unga
    // `?trigger_name=<page>` bilan o'tadi va page filtri qulflanadi.
    path: AppPaths.Audit,
    name: AppPaths.Audit.substring(1),
    component: () => import('@pages/audit/AuditPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: AppPaths.Info,
    component:()=> import('@pages/others/info/page.vue'),
    meta: {
      layout: AppLayouts.main
    }
  }
]
