import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import ConfirmationContract from "@/pages/docFlow/confirmation/contract/ConfirmationContract.vue"
import ConfirmCommand from "@/pages/docFlow/confirmation/command/ConfirmCommand.vue"
import AdContractPage from "@/pages/docFlow/confirmation/adContract/AdContractPage.vue"

export default [
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.ConfContract),
        component:ConfirmationContract,
        children:[],
    },
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.ConfCommand),
        component:ConfirmCommand,
        children:[],
    },
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.ConfAdContract),
        component:AdContractPage,
        children:[],
    }

]