import Utils from "@/utils/Utils.js";
import {AppPaths} from "@/utils/index.js";
import {ExpiredHealthPage, TicketPage, MedWorkerPage} from "@/pages/hospital/index.js"


export default [
    {
        path:Utils.routeHospitalPathMaker(AppPaths.ExpiredHealth),
        component: ExpiredHealthPage,
    },
    {
        path:Utils.routeHospitalPathMaker(AppPaths.Ticket),
        component: TicketPage,
    },
    {
        path:Utils.routeHospitalPathMaker(AppPaths.MedWorker),
        component: MedWorkerPage,
    },

]