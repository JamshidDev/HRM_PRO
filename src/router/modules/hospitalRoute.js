import Utils from "@/utils/Utils.js";
import {AppLayouts, AppPaths} from "@/utils/index.js"
import {
    ExpiredHealthPage,
    TicketPage,
    MedWorkerPage,
    MedPensionerPage,
} from "@/pages/hospital/index.js"


export default [
    {
        path:Utils.routeHospitalPathMaker(AppPaths.ExpiredHealth),
        component: ExpiredHealthPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeHospitalPathMaker(AppPaths.Ticket),
        component: TicketPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeHospitalPathMaker(AppPaths.MedWorker),
        component: MedWorkerPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeHospitalPathMaker(AppPaths.Pensioner),
        component: MedPensionerPage,
        meta:{
            layout:AppLayouts.main
        },
    },

]