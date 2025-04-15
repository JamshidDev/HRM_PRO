import Utils from "@/utils/Utils.js";
import {AppPaths} from "@/utils/index.js";
import {OthersDashboardPage} from "@/pages/others/index.js";

export default [{
    path:Utils.routeOtherPathMaker(AppPaths.Dashboard),
    component: OthersDashboardPage,
}]