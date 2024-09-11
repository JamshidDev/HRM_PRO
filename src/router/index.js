
import {createRouter, createWebHistory} from "vue-router"

import LoginPage from "@/pages/login/LoginPage.vue"
import NotFoundPage from "@/pages/notFound/NotFoundPage.vue"
import RegisterPage from "@/pages/register/RegisterPage.vue";
import ServiceLayout from "@/layouts/Organization/Service/ServiceLayout.vue";
import MainLayout from "@/layouts/Main/MainLayout.vue";
import VerificationEmailPage from "@/pages/verificationEmail/VerificationEmailPage.vue"



const routes = [
    {
        path:"/admin",
        name:"mainLayout",
        component:MainLayout,
    },
    {
        path:"/register",
        name:"register",
        component:RegisterPage,
        children:[]
    },
    {
        path:"/verification-email",
        name:"verificationEmail",
        component:VerificationEmailPage,
        children:[]
    },
    {
        path:"/login",
        name:"login",
        component:LoginPage,
        children:[]
    },
    {
        path:"/register-service",
        name:"register-service",
        component:ServiceLayout,
        children:[]
    },
    {
        path:"/login",
        name:"login",
        component:LoginPage,
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: NotFoundPage,
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router