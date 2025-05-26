import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import TopicDetailPage from "@/pages/attestation/topic/topicDetail/TopicDetailPage.vue"
import {
    TopicPage,
    CategoryPage,
    CategoryQuestionPage,
    WorkerTopicPage,
    SolveExamPage,
    ExamResultPage
} from "@/pages/attestation";


export default [
    {
        path:Utils.routeAttestationPathMaker(AppPaths.Topic),
        name:AppPaths.Topic.substring(1),
        component:()=>TopicPage,
        children:[{
            path:':id',
            component:TopicDetailPage,
            children:[],
        }],
    },
    {
        path:Utils.routeAttestationPathMaker(AppPaths.Category),
        name:AppPaths.Category.substring(1),
        component:()=>CategoryPage,
        children:[],
    },
    {
        path:Utils.routeAttestationPathMaker(`${AppPaths.Category}/:category_id${AppPaths.Questions}`),
        component:()=>CategoryQuestionPage,
        name: "category_question",
        children:[],
    },
    {
        path:Utils.routeAttestationPathMaker(`${AppPaths.Result}`),
        component: ()=>ExamResultPage,
        children:[],
    },
    {
        path:Utils.routeAttestationPathMaker(AppPaths.Exam),
        component:()=>WorkerTopicPage,
        children:[],
    },
    {
        path:Utils.routeAttestationPathMaker(`${AppPaths.Exam}/:exam_id/solve`),
        name: 'solve_exam',
        component: ()=>SolveExamPage,
        children:[],
    },
]