
import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import WorkerPage from "@/pages/hrm/worker/WorkerPage.vue"
import DepartmentPage from "@/pages/hrm/depertment/DepartmentPage.vue"

export default [
    {
        path:Utils.routeHrmPathMaker(AppPaths.Worker),
        name:AppPaths.Worker.substring(1),
        component:WorkerPage,
        children:[],
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.Department),
        name:AppPaths.Department.substring(1),
        component:DepartmentPage,
        children:[],
    },
]