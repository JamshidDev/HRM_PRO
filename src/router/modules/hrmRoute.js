
import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import WorkerPage from "@/pages/hrm/worker/WorkerPage.vue"
import DepartmentPage from "@/pages/hrm/depertment/DepartmentPage.vue"
import DepartmentPositionPage from "@/pages/hrm/departmentPosition/departmentPositionPage.vue"

export default [
    {
        path:Utils.routeHrmPathMaker(AppPaths.Worker),
        name:AppPaths.Worker.substring(1),
        component:WorkerPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.Department),
        name:AppPaths.Department.substring(1),
        component:DepartmentPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.DepartmentPosition),
        name:AppPaths.DepartmentPosition.substring(1),
        component:DepartmentPositionPage,
    },
]