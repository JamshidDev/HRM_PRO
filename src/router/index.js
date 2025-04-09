
import {createRouter, createWebHistory} from "vue-router"
import {AppPaths, useAppSetting} from "@/utils/index.js"
import ProfilePage from "@/pages/app/profile/ProfilePage.vue";

// routes
import adminRoute from "@/router/modules/adminRoute.js";
import hrmRoute from "@/router/modules/hrmRoute.js"
import chatRoute from "@/router/modules/chatRoute.js"
import lmsRoute from "@/router/modules/lmsRoute.js"
import appRoute from "@/router/modules/appRoute.js"
import docflowRoute from "@/router/modules/docflowRoute.js"
import turnstileRoute from "@/router/modules/turnstileRoute.js"
const beforeLogin = (to, from, next) => {
    const token = localStorage.getItem(useAppSetting.tokenKey);
    if (token) {
        next()
    }else {
        localStorage.removeItem(useAppSetting.tokenKey);
        next(AppPaths.Login);
    }
};



const routes = [
    ...appRoute,
    {
        path:AppPaths.Main,
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: [
            {
                path:AppPaths.Admin,
                name:AppPaths.Admin.substring(1),
                beforeEnter: beforeLogin,
                redirect: AppPaths.Home,
                children: [...adminRoute]
            },
            {
                path:AppPaths.Hrm,
                name:AppPaths.Hrm.substring(1),
                beforeEnter: beforeLogin,
                redirect: AppPaths.Home,
                children: [...hrmRoute]
            },
            {
                path:AppPaths.Chat,
                name:AppPaths.Chat.substring(1),
                beforeEnter: beforeLogin,
                redirect: AppPaths.Home,
                children: [...chatRoute]
            },
            {
                path:AppPaths.Lms,
                name:AppPaths.Lms.substring(1),
                beforeEnter: beforeLogin,
                redirect: AppPaths.Home,
                children: [...lmsRoute]
            },
            {
                path:AppPaths.Turnstile,
                name:AppPaths.Turnstile.substring(1),
                beforeEnter: beforeLogin,
                redirect: AppPaths.Home,
                children: [...turnstileRoute]
            },
            {
                path:AppPaths.DocFlow,
                name:AppPaths.DocFlow.substring(1),
                beforeEnter: beforeLogin,
                redirect: AppPaths.Home,
                children: [...docflowRoute]
            },
            {
                path:AppPaths.Profile,
                name:AppPaths.Profile.substring(1),
                component: ProfilePage,
            }

        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router