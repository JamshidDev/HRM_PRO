import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import {
    DirectionPage,
    SpecializationPage
} from "@/pages/lms";


export default [
    {
        path:Utils.routeLmsPathMaker(AppPaths.Direction),
        component: DirectionPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(AppPaths.Specialization),
        component: SpecializationPage,
        children:[],
    },
]