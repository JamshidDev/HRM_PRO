import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import TopicDetailPage from "@/pages/lms/topicDetail/TopicDetailPage.vue"
import {
    TopicPage,
    CategoryPage,
    CategoryQuestionPage,
    QuestionFormPage,
    WorkerExamPage,
    SolveExamPage, ExamDetailPage
} from "@/pages/lms";
import WorkerExam from "@/pages/lms/workerExam/WorkerExam.vue";

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
        component:()=>WorkerExamPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(`${AppPaths.Exam}/:exam_id`),
        name: 'exam_detail',
        component: ()=>ExamDetailPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(`${AppPaths.Exam}/:exam_id/solve`),
        name: 'solve_exam',
        component: ()=>SolveExamPage,
        children:[],
    },
]