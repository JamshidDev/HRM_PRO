import {AppLayouts, AppPaths} from "@/utils/index.js"
import {InfoPage} from "@/pages/others/index.js";

export default [{
    path:AppPaths.Info,
    component: InfoPage,
    meta:{
        layout:AppLayouts.main
    },
}]