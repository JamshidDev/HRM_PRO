import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import {
    DirectionPage,
    SpecializationPage,
    SubjectPage,
    EduPlanPage,
    TeacherPage
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
    {
        path:Utils.routeLmsPathMaker(AppPaths.Subject),
        component: SubjectPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(AppPaths.EduPlan),
        component: EduPlanPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(AppPaths.Teacher),
        component: TeacherPage,
        children:[],
    },
]