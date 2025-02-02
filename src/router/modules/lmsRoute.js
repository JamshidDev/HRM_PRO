
import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import ExamPage from "@/pages/lms/exam/ExamPage.vue"
import TopicPage from "@/pages/lms/topic/TopicPage.vue"
import TopicDetailPage from "@/pages/lms/topicDetail/topicDetailPage.vue"

export default [
    {
        path:Utils.routeLmsPathMaker(AppPaths.Exam),
        name:AppPaths.Exam.substring(1),
        component:ExamPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(AppPaths.Topic),
        name:AppPaths.Topic.substring(1),
        component:TopicPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(AppPaths.Topic+'/:id'),
        component:TopicDetailPage,
        children:[],
    },
]