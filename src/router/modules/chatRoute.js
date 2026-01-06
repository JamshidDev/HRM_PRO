import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

import {NotificationPage} from "@pages/chat/index.js";

export const chatRoutes = [
    {
        path: Utils.routeChatPathMaker(AppPaths.Notification),
        component: NotificationPage,
        meta: {
            layout: AppLayouts.main
        }
    },

]
