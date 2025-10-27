import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import {
    ConfContractPage,
    ConfAddContractPage,
    ConfApplicationPage,
    ConfCommandPage,
    ConfTimeSheetPage,
} from "@/pages/docFlow/index.js"


export default [
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.ConfContract),
        component:ConfContractPage,
    },
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.ConfCommand),
        component:ConfCommandPage,
    },
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.ConfAdContract),
        component:ConfAddContractPage,
    },
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.ConfApplication),
        component:ConfApplicationPage,
    },
    {
        path:Utils.routeDocFlowPathMaker(AppPaths.TimeSheet),
        component:ConfTimeSheetPage,
    },
]