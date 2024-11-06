
import {createRouter, createWebHistory} from "vue-router"

import LoginPage from "@/pages/app/login/LoginPage.vue"
import NotFoundPage from "@/pages/app/notFound/NotFoundPage.vue"
import RegisterPage from "@/pages/app/register/RegisterPage.vue";
import HomePage from "@/pages/app/home/HomePage.vue";
import {AppPaths, AppLayouts} from "@/utils/index.js";
import ProfilePage from "@/pages/app/profile/ProfilePage.vue";

// routes
import adminRoute from "@/router/modules/adminRoute.js";
import hrmRoute from "@/router/modules/hrmRoute.js"
import chatRoute from "@/router/modules/chatRoute.js"
import lmsRoute from "@/router/modules/lmsRoute.js"
import docflowRoute from "@/router/modules/docflowRoute.js"


const beforeLogin = (to, from, next) => {
    const token = localStorage.getItem("token");
    if (token) {
        next()
    }else {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        next(AppPaths.Login);
    }
};



const routes = [
    {
        path:AppPaths.Main,
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: [
            {
                path:AppPaths.Home,
                name:AppPaths.Home.substring(1),
                component:HomePage,
                beforeEnter: beforeLogin,
                children: []
            },
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


    {
        path:AppPaths.Register,
        name:AppPaths.Register.substring(1),
        component:RegisterPage,
        meta:{
            layout:AppLayouts.empty
        }
    },
    {
        path:AppPaths.Login,
        name:AppPaths.Login.substring(1),
        component:LoginPage,
        meta:{
            layout:AppLayouts.empty
        }
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: NotFoundPage,
        meta:{
            layout:AppLayouts.empty
        }
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router