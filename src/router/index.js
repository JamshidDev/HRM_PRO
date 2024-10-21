
import {createRouter, createWebHistory} from "vue-router"

import LoginPage from "@/pages/login/LoginPage.vue"
import NotFoundPage from "@/pages/notFound/NotFoundPage.vue"
import RegisterPage from "@/pages/register/RegisterPage.vue";
import ServiceLayout from "@/layouts/Organization/Service/ServiceLayout.vue";
import MainLayout from "@/layouts/Main/MainLayout.vue";
import VerificationEmailPage from "@/pages/verificationEmail/VerificationEmailPage.vue"
import DashboardPage from "@/pages/dashboard/DashboardPage.vue";
import CategoryPage from "@/pages/category/CategoryPage.vue";
import ClientPage from "@/pages/client/clientPage.vue";
import ProductPage from "@/pages/product/ProductPage.vue";
import {AppPaths} from "@/utils/index.js";

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
        component:MainLayout,
        beforeEnter: beforeLogin,
        redirect: AppPaths.Admin,
    },
    {
        path:AppPaths.Admin,
        name:AppPaths.Admin.substring(1),
        component:MainLayout,
        beforeEnter: beforeLogin,
        children: [
            {
                path:`${AppPaths.Admin}${AppPaths.Dashboard}`,
                name:AppPaths.Dashboard.substring(1),
                component:DashboardPage,
            },
            {
                path:`${AppPaths.Admin}${AppPaths.Category}`,
                name:AppPaths.Category.substring(1),
                component:CategoryPage,
            },
            {
                path:`${AppPaths.Admin}${AppPaths.Client}`,
                name:AppPaths.Client.substring(1),
                component:ClientPage,
            },
            {
                path:`${AppPaths.Admin}${AppPaths.Product}`,
                name:AppPaths.Product.substring(1),
                component:ProductPage,
            }
        ]
    },
    {
        path:AppPaths.Register,
        name:AppPaths.Register.substring(1),
        component:RegisterPage,
        children:[]
    },
    {
        path:AppPaths.VerificationEmail,
        name:AppPaths.VerificationEmail.substring(1),
        component:VerificationEmailPage,
        children:[]
    },
    {
        path:AppPaths.RegisterService,
        name:AppPaths.RegisterService.substring(1),
        component:ServiceLayout,
        children:[]
    },
    {
        path:AppPaths.Login,
        name:AppPaths.Login.substring(1),
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