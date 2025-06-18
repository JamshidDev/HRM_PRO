import Utils from "@/utils/Utils.js";
import {AppPaths} from "@/utils/index.js";
import {UploadReportPage, MonthReportPage, TaxFourPage, TaxFivePage, DashboardPage} from "@/pages/accountant/index.js"


export default [
    {
    path:Utils.routeAccountantPathMaker(AppPaths.UploadReport),
    component: UploadReportPage,
    },
    {
        path:Utils.routeAccountantPathMaker(AppPaths.MonthReport),
        component: MonthReportPage,
    },
    {
        path:Utils.routeAccountantPathMaker(AppPaths.TaxFour),
        component: TaxFourPage,
    },
    {
        path:Utils.routeAccountantPathMaker(AppPaths.TaxFive),
        component: TaxFivePage,
    },
    {
        path:Utils.routeAccountantPathMaker(AppPaths.Dashboard),
        component: DashboardPage,
    },

]