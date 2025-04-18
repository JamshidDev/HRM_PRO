import {AppLayouts, AppPaths} from "@/utils/index.js"
import HomePage from "@/pages/app/home/HomePage.vue"
import RegisterPage from "@/pages/app/register/RegisterPage.vue"
import LoginPage from "@/pages/app/login/LoginPage.vue"
import NotFoundPage from "@/pages/app/notFound/NotFoundPage.vue"
import DocumentSignature from "@/pages/app/documentSignature/DocumentSignature.vue"
import LoginPagev2 from "@/pages/app/login/LoginPagev2.vue"
import LoginPageV3 from "@/pages/app/login/LoginPageV3.vue"
import AIConversationPage from "@/pages/app/ai/AIConversationPage.vue"

export default [

    {
        path:AppPaths.DocumentViewer+'/:status',
        name:AppPaths.DocumentViewer.substring(1),
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
        path:AppPaths.AIConversation,
        name:AppPaths.AIConversation.substring(1),
        component:AIConversationPage,
        meta:{
            layout:AppLayouts.main
        },
        children: []
    },
    {
        path:AppPaths.Register,
        name:AppPaths.Register.substring(1),
        // component:RegisterPage,
        component:LoginPageV3,
        meta:{
            layout:AppLayouts.empty
        }
    },
    {
        path:AppPaths.Login,
        name:AppPaths.Login.substring(1),
        // component:LoginPage,
        component:LoginPagev2,
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