
import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import WorkerPage from "@/pages/hrm/worker/WorkerPage.vue"
import DepartmentPage from "@/pages/hrm/depertment/DepartmentPage.vue"
import DepartmentPositionPage from "@/pages/hrm/departmentPosition/departmentPositionPage.vue"
import CandidatePage from "@/pages/hrm/condidate/CandidatePage.vue"
import DocumentPage from "@/pages/docFlow/document/DocumentPage.vue"


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
    {
        path:Utils.routeHrmPathMaker(`${AppPaths.Worker}${AppPaths.Create}`),
        name:`${AppPaths.Worker.substring(1)}-${AppPaths.Create.substring(1)}`,
        component:CandidatePage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.Document),
        name:AppPaths.Document.substring(1),
        component:DocumentPage,
    },
]