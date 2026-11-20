import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

export const attestationRoutes = [
  {
    path: Utils.routeAttestationPathMaker(AppPaths.Exams),
    name: AppPaths.Exams.substring(1),
    component: () => import('@/pages/attestation/topic/TopicPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  // Eski manzillar (mavzular / xodim imtihonlari) yangisiga yo'naltiriladi.
  {
    path: Utils.routeAttestationPathMaker(AppPaths.Topic),
    redirect: Utils.routeAttestationPathMaker(AppPaths.Exams)
  },
  {
    path: Utils.routeAttestationPathMaker(AppPaths.Exam),
    redirect: Utils.routeAttestationPathMaker(AppPaths.MyExams)
  },
  {
    path: Utils.routeAttestationPathMaker(`${AppPaths.Exam}/:exam_id/solve`),
    redirect: (to) =>
      Utils.routeAttestationPathMaker(`${AppPaths.MyExams}/${to.params.exam_id}/solve`)
  },
  {
    path: Utils.routeAttestationPathMaker(AppPaths.Category),
    name: AppPaths.Category.substring(1),
    component: () => import('@/pages/attestation/category/CategoryPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAttestationPathMaker(`${AppPaths.Category}/:category_id${AppPaths.Questions}`),
    component: () =>
      import('@/pages/attestation/category/categoryQuestion/CategoryQuestionPage.vue'),
    name: 'category_question',
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAttestationPathMaker(`${AppPaths.Result}`),
    component: () => import('@/pages/attestation/examResult/ResultPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAttestationPathMaker(AppPaths.MyExams),
    component: () => import('@/pages/attestation/workerTopic/WorkerTopic.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAttestationPathMaker(`${AppPaths.MyExams}/:exam_id/solve`),
    name: 'solve_exam',
    component: () => import('@/pages/attestation/workerTopic/solveExam/SolveExamPage.vue'),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeAttestationPathMaker(`${AppPaths.Camera}`),
    component: () => import('@/pages/attestation/Camera/CameraApp.vue'),
    meta: {
      layout: AppLayouts.main
    }
  }
]
