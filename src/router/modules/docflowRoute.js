import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import DocumentHistory from "@/pages/docFlow/documentHistory/DocumentHistory.vue"

export default [
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.DocumentHistory),
        name:AppPaths.DocumentHistory.substring(1),
        component:DocumentHistory,
        children:[],
    }
]