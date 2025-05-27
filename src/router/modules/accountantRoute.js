import Utils from "@/utils/Utils.js";
import {AppPaths} from "@/utils/index.js";
import UploadReport from "@/pages/accountant/report/UploadReport.vue"

export default [{
    path:Utils.routeAccountantPathMaker(AppPaths.UploadReport),
    component: UploadReport,
}]