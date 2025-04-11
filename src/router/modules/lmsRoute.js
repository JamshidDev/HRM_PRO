import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import TopicDetailPage from "@/pages/lms/topic/topicDetail/TopicDetailPage.vue"
import {
    TopicPage,
    CategoryPage,
    CategoryQuestionPage,
    WorkerTopicPage,
    SolveExamPage,
    ExamResultPage
} from "@/pages/lms";


export default [
    {
        path:Utils.routeLmsPathMaker(AppPaths.Topic),
        name:AppPaths.Topic.substring(1),
        component:()=>TopicPage,
        children:[{
            path:':id',
            component:TopicDetailPage,
            children:[],
        }],
    },

    {
        path:Utils.routeLmsPathMaker(AppPaths.Category),
        name:AppPaths.Category.substring(1),
        component:()=>CategoryPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(`${AppPaths.Category}/:category_id${AppPaths.Questions}`),
        component:()=>CategoryQuestionPage,
        name: "category_question",
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(`${AppPaths.Result}`),
        component: ()=>ExamResultPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(AppPaths.Exam),
        component:()=>WorkerTopicPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(`${AppPaths.Exam}/:exam_id/solve`),
        name: 'solve_exam',
        component: ()=>SolveExamPage,
        children:[],
    },

]