import Utils from "@/utils/Utils.js";
import {AppPaths} from "@/utils/index.js";
import {InfoPage} from "@/pages/others/index.js";

export default [{
    path:Utils.routeOtherPathMaker(AppPaths.Info),
    component: InfoPage,
}]