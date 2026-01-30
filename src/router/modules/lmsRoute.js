import { AppLayouts, AppPaths } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

export const lmsRoutes = [
  {
    path: Utils.routeLmsPathMaker(AppPaths.Direction),
    component: ()=> import("@/pages/lms/Direction/DirectionPage.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Specialization),
    component: ()=> import("@/pages/lms/Specialization/SpecializationPage.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Subject),
    component: ()=> import("@/pages/lms/Subject/SubjectPage.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.EduPlan),
    component: ()=> import("@/pages/lms/EduPlan/EduPlan.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Teacher),
    component: ()=> import("@/pages/lms/Teacher/TeacherPage.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Group) + '/:id',
    component: ()=> import("@/pages/lms/Group/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Lesson),
    component: ()=> import("@/pages/lms/Lesson/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.TeacherLesson),
    component: ()=> import("@/pages/lms/TeacherLesson/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Listener),
    component: ()=> import("@/pages/lms/Listener/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Result),
    component: ()=> import("@/pages/lms/Result/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  },
  {
    path: Utils.routeLmsPathMaker(AppPaths.Certificate),
    component: ()=> import("@/pages/lms/Certificate/page.vue"),
    meta: {
      layout: AppLayouts.main
    }
  }


]
