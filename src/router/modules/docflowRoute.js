import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import ConfirmationContract from "@/pages/docFlow/confirmation/contract/ConfirmationContract.vue"
import ConfirmCommand from "@/pages/docFlow/confirmation/command/ConfirmCommand.vue"
import AdContractPage from "@/pages/docFlow/confirmation/adContract/AdContractPage.vue"
import ConfApplication from "@/pages/docFlow/confirmation/application/ConfApplication.vue"
import TimeSheetPage from "@/pages/docFlow/confirmation/timesheet/TimeSheetPage.vue"

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
    },
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.ConfApplication),
        component:ConfApplication,
        children:[],
    },
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.TimeSheet),
        component:TimeSheetPage,
        children:[],
    },
]