import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"


import {DepartmentPage} from "@/pages/labor";


export default [
    {
        path:Utils.routeLaborPathMaker(AppPaths.Department),
        component:()=>DepartmentPage,
        children:[],
    },
]