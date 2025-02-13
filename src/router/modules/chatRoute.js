import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import ContactPage from "@/pages/chat/Contact/ContactPage.vue"
import ChatContainerPage from "@/pages/chat/chatElements/ChatContainerPage.vue"

export default [
    {
        path:Utils.routeChatPathMaker(AppPaths.ChatWindow),
        name:AppPaths.ChatWindow.substring(1),
        component:ChatContainerPage,
        children:[],
    }

]