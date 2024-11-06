
import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import WorkerPage from "@/pages/hrm/worker/WorkerPage.vue"

export default [
    {
        path:Utils.routeHrmPathMaker(AppPaths.Worker),
        name:'dfsdfsd',
        component:WorkerPage,
        children:[],
    }
]