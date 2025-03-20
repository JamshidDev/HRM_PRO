import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"


import {DepartmentPage, TimeSheetListPage} from "@/pages/timesheet";


export default [
    {
        path:Utils.routeTimesheetPathMaker(AppPaths.Department),
        component:()=>DepartmentPage,
        children:[],
    },
    {
        path:Utils.routeTimesheetPathMaker(AppPaths.TimeSheet),
        component:()=>TimeSheetListPage,
        children:[],
    },
]