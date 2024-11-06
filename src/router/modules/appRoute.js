import {AppLayouts, AppPaths} from "@/utils/index.js"
import DashboardPage from "@/pages/app/dashboard/DashboardPage.vue"
import HomePage from "@/pages/app/home/HomePage.vue"
import RegisterPage from "@/pages/app/register/RegisterPage.vue"
import LoginPage from "@/pages/app/login/LoginPage.vue"
import NotFoundPage from "@/pages/app/notFound/NotFoundPage.vue"

export default [
    {
        path:AppPaths.Dashboard,
        name:AppPaths.Dashboard.substring(1),
        component:DashboardPage,
        children:[],
    },
    {
        path:AppPaths.Home,
        name:AppPaths.Home.substring(1),
        component:HomePage,
        children: []
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