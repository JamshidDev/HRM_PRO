
import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import ExamPage from "@/pages/lms/exam/ExamPage.vue"

export default [
    {
        path:Utils.routeLmsPathMaker(AppPaths.Exam),
        name:AppPaths.Exam.substring(1),
        component:ExamPage,
        children:[],
    }
]