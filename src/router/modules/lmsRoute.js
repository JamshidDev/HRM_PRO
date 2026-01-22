import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'
import {
  DirectionPage,
  SpecializationPage,
  SubjectPage,
  EduPlanPage,
  TeacherPage,
  LmsGroupPage,
  LmsLessonPage,
  TeacherLessonPage,
  ListenerPage,
  LmsResultPage, LmsCertificatePage
} from '@/pages/lms'

export const lmsRoutes = [
  {
    path: Utils.routeLmsPathMaker(AppPaths.Direction),
    component: DirectionPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Specialization),
    component: SpecializationPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Subject),
    component: SubjectPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.EduPlan),
    component: EduPlanPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Teacher),
    component: TeacherPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Group) + '/:id',
    component: LmsGroupPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Lesson),
    component: LmsLessonPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.TeacherLesson),
    component: TeacherLessonPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Listener),
    component: ListenerPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Result),
    component: LmsResultPage,
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Certificate),
    component: LmsCertificatePage,
    meta: {
      layout: AppLayouts.main
    }
  }


]
