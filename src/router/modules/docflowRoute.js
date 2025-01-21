import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import DocumentHistory from "@/pages/docFlow/documentHistory/DocumentHistory.vue"
import ConfirmationPage from "@/pages/hrm/confirmation/ConfirmationPage.vue"
import ConfirmationOrder from "@/pages/docFlow/document/confirmation/ConfirmationOrder.vue"

export default [
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.DocumentHistory),
        name:AppPaths.DocumentHistory.substring(1),
        component:DocumentHistory,
        children:[],
    },
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.Confirmation),
        component:ConfirmationOrder,
        children:[],
    }

]