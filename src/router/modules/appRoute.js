import {AppLayouts, AppPaths} from "@/utils/index.js"
import DashboardPage from "@/pages/app/dashboard/DashboardPage.vue"
import HomePage from "@/pages/app/home/HomePage.vue"
import RegisterPage from "@/pages/app/register/RegisterPage.vue"
import LoginPage from "@/pages/app/login/LoginPage.vue"
import NotFoundPage from "@/pages/app/notFound/NotFoundPage.vue"
import DrawSignaturePage from "@/pages/app/drawSignature/DrawSignaturePage.vue"
import DocViewer from "@/pages/app/docViewer/DocViewer.vue"
import DocumentSignature from "@/pages/app/documentSignature/DocumentSignature.vue"

export default [
    {
        path:AppPaths.Dashboard,
        name:AppPaths.Dashboard.substring(1),
        component:DashboardPage,
        meta:{
            layout:AppLayouts.main
        },
        children:[],
    },
    {
        path:AppPaths.DrawingSignature,
        name:AppPaths.DrawingSignature.substring(1),
        component:DrawSignaturePage,
        meta:{
            layout:AppLayouts.empty
        },
        children:[],
    },
    {
        path:AppPaths.DocViewer,
        name:AppPaths.DocViewer.substring(1),
        component:DocViewer,
        meta:{
            layout:AppLayouts.empty
        },
        children:[],
    },
    {
        path:AppPaths.DocumentSignature,
        name:AppPaths.DocumentSignature.substring(1),
        component:DocumentSignature,
        meta:{
            layout:AppLayouts.empty
        },
        children:[],
    },
    {
        path:AppPaths.Home,
        name:AppPaths.Home.substring(1),
        component:HomePage,
        meta:{
            layout:AppLayouts.main
        },
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