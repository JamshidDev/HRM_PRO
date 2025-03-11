import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"


import {DepartmentPage, TimeSheetPage} from "@/pages/labor";


export default [
    {
        path:Utils.routeLaborPathMaker(AppPaths.Department),
        component:()=>DepartmentPage,
        children:[],
    },
    {
        path:Utils.routeLaborPathMaker(AppPaths.TimeSheet),
        component:()=>TimeSheetPage,
        children:[],
    },
]