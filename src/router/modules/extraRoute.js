import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from "@utils/Utils.js"

export const extraRoutes = [
    {
        path: Utils.routeExtraPathMaker(AppPaths.WorkerRole),
        component:()=> import('@pages/extra/UserRole/UserRolePage.vue'),
        meta: {
            layout: AppLayouts.main
        }
    },
    {
        path: Utils.routeExtraPathMaker(AppPaths.AdminOther),
        component: () => import('@pages/extra/educationDirectory/EducationDirectoryPage.vue'),
        meta: {
            layout: AppLayouts.main
        }
    }
]
