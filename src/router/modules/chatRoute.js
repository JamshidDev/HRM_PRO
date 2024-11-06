import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import ContactPage from "@/pages/chat/Contact/ContactPage.vue"

export default [
    {
        path:Utils.routeChatPathMaker(AppPaths.Contact),
        name:AppPaths.Contact.substring(1),
        component:ContactPage,
        children:[],
    }
]