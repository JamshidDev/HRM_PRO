
import {createRouter, createWebHistory} from "vue-router"

import LoginPage from "@/pages/login/LoginPage.vue"
import NotFoundPage from "@/pages/notFound/NotFoundPage.vue"
import RegisterPage from "@/pages/register/RegisterPage.vue";



const routes = [
    {
        path:"/",
        name:"mainLayout",
        component:LoginPage,
        children:[]
    },
    {
        path:"/authentication",
        name:"authentication",
        component:RegisterPage,
        children:[]
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