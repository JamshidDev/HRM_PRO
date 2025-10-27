import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import {
    TopicPage,
    CategoryPage,
    CategoryQuestionPage,
    WorkerTopicPage,
    SolveExamPage,
    ExamResultPage,
    CameraPage,
    TopicDetailPage,
} from "@/pages/attestation";


export default [
    {
        path:Utils.routeAttestationPathMaker(AppPaths.Topic),
        name:AppPaths.Topic.substring(1),
        component:TopicPage,
        children:[{
            path:':id',
            component:TopicDetailPage,
        }],
    },
    {
        path:Utils.routeAttestationPathMaker(AppPaths.Category),
        name:AppPaths.Category.substring(1),
        component:CategoryPage,
    },
    {
        path:Utils.routeAttestationPathMaker(`${AppPaths.Category}/:category_id${AppPaths.Questions}`),
        component:CategoryQuestionPage,
        name: "category_question",
    },
    {
        path:Utils.routeAttestationPathMaker(`${AppPaths.Result}`),
        component: ExamResultPage,
    },
    {
        path:Utils.routeAttestationPathMaker(AppPaths.Exam),
        component:WorkerTopicPage,
    },
    {
        path:Utils.routeAttestationPathMaker(`${AppPaths.Exam}/:exam_id/solve`),
        name: 'solve_exam',
        component: SolveExamPage,
    },
    {
        path:Utils.routeAttestationPathMaker(`${AppPaths.Camera}`),
        component: CameraPage,

    },
]