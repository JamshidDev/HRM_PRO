import Utils from "@/utils/Utils.js";
import {AppPaths} from "@/utils/index.js";
import {UploadReportPage, MonthReportPage} from "@/pages/accountant/index.js"


export default [
    {
    path:Utils.routeAccountantPathMaker(AppPaths.UploadReport),
    component: UploadReportPage,
    },
    {
        path:Utils.routeAccountantPathMaker(AppPaths.MonthReport),
        component: MonthReportPage,
    },

]