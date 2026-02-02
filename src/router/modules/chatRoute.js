import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

export const chatRoutes = [
    {
        path: Utils.routeChatPathMaker(AppPaths.Notification),
        component: ()=> import("@/pages/chat/notification/NotificationPage.vue"),
        meta: {
            layout: AppLayouts.main
        }
    },

]
