import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import TopicDetailPage from "@/pages/lms/topicDetail/TopicDetailPage.vue"
import {
    TopicPage,
    CategoryPage,
    CategoryQuestionPage,
    QuestionFormPage,
    WorkerTopicPage,
    SolveExamPage,
    ViewExamPage
} from "@/pages/lms";


export default [
    {
        path:Utils.routeLmsPathMaker(AppPaths.Topic),
        name:AppPaths.Topic.substring(1),
        component:()=>TopicPage,
        children:[],
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
        path:Utils.routeLmsPathMaker(`${AppPaths.Category}/:category_id${AppPaths.Questions}${AppPaths.Create}`),
        component:()=>QuestionFormPage,
        name: "add_question",
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(`${AppPaths.Category}/:category_id${AppPaths.Questions}/:question_id`),
        component:()=>QuestionFormPage,
        name: "edit_question",
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(AppPaths.Topic+'/:id'),
        component:TopicDetailPage,
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
    {
        path:Utils.routeLmsPathMaker(`${AppPaths.Exam}/attempt/:exam_id`),
        name: 'exam_attempt',
        component: ()=>ViewExamPage,
        children:[],
    },
]