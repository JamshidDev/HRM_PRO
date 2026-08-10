import { createRouter, createWebHistory } from 'vue-router'
import { AppLayouts, AppPaths, useAppSetting } from '@/utils/index.js'
import { useAccountStore } from '@/store/modules/app/accountStore.js'
import i18n from '@/i18n/index.js'

import {
  adminRoutes,
  appRoutes,
  attestationRoutes,
  docFlowRoutes,
  hrmRoutes,
  othersRoutes,
  lmsRoutes,
  accountantRoutes,
  turnstileRoutes,
  hospitalRoutes,
  chatRoutes,
  extraRoutes,
} from '@/router/modules'

// Token qo'riqchisi. Profilni yuklash endi `beforeEach` ichida (u BIRINCHI ishlaydi),
// bu yerda faqat token tekshiriladi — ruxsatsiz route'lar uchun ham profil kerak.
const beforeLogin = async (to, from, next) => {
  const token = localStorage.getItem(useAppSetting.tokenKey)
  if (token) {
    const accountStore = useAccountStore()
    if (!accountStore.permissionsLoaded) {
      // 401 bo'lsa axios interceptor Login'ga o'zi yo'naltiradi (service/index.js);
      // shu yerda xatoni yutib, navigatsiyani "osilib qolishdan" saqlaymiz.
      await accountStore._index().catch(() => {})
    }
    next()
  } else {
    localStorage.removeItem(useAppSetting.tokenKey)
    next(AppPaths.Login)
  }
}

import {navigations} from "@/layouts/data/navigations.js"

const routes = [
  ...appRoutes,
  {
    path: AppPaths.Main,
    beforeEnter: beforeLogin,
    redirect: AppPaths.Home,
    children: [
      {
        path: AppPaths.Admin,
        name: AppPaths.Admin.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: adminRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Hrm,
        name: AppPaths.Hrm.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: hrmRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Attestation,
        name: AppPaths.Attestation.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: attestationRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Turnstile,
        name: AppPaths.Turnstile.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: turnstileRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.DocFlow,
        name: AppPaths.DocFlow.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: docFlowRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Lms,
        name: AppPaths.Lms.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: lmsRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Others,
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: othersRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Accountant,
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: accountantRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Hospital,
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: hospitalRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Chat,
        name: AppPaths.Chat.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: chatRoutes,
        meta: {
          layout: AppLayouts.main
        }
      },
      {
        path: AppPaths.Extra,
        name: AppPaths.Extra.substring(1),
        beforeEnter: beforeLogin,
        redirect: AppPaths.Home,
        children: extraRoutes,
        meta: {
          layout: AppLayouts.main
        }
      }
    ]
  }
]

const calculatePermission = ()=> {
  let permissions = []
  navigations.forEach(v => {
    const list = [...v.children.map(x => ({path: x.path, permission: x.permission}))]
    permissions = [...permissions, ...list]
  })
  return [...permissions, ...navigations.map(x=>({path: x.path, permission: x.permission}))]
}
const allPermission =calculatePermission()
const findPermissionByPath = (path)=> {
  const result = allPermission.filter(x=>x.path === path)
  return result.length > 0? result[0].permission : null
}
// `permission` kaliti FAQAT hal bo'lgan holda yoziladi.
//
// Nega muhim: vue-router `to.meta`ni matched yozuvlar bo'ylab ota→bola birlashtiradi
// (bola ustun turadi). Ilgari bu yerda kalit HAR DOIM yozilardi — navigatsiyada bandi
// yo'q bolaga `permission: null` tushib, ota `/hrm` yozuvining `'hr'` qiymatini
// QOPLAB tashlardi. Natijada `hrm/candidate`, `hrm/workerProfile`, `attestation/Camera`
// va izohga olingan turnstile route'lari URL orqali hammaga ochiq edi.
// Kalitni tashlab ketsak, bola otadan meros oladi — ya'ni yangi qo'shilgan route ham
// avtomatik modul darajasida yopiq bo'ladi (fail-safe default).
const attachPermissionToRouter = (routes)=>{
  return routes.map(node=>{
    // Route faylida qo'lda yozilgani ustun; aks holda navigations.js dan qidiriladi.
    const permission = node.meta?.permission ?? findPermissionByPath(node.path)
    const newNode = {
      ...node,
      meta:{
        ...node.meta,
        ...(permission ? { permission } : {})
      }
    }
    if(node.children && node.children.length){
      newNode.children = attachPermissionToRouter(node.children)
    }
    return newNode
  })

}
const newRouter = attachPermissionToRouter(routes)

const router = createRouter({
  history: createWebHistory(),
  routes: newRouter
})

/** Foydalanuvchiga ochiq birinchi modul — rad etilganda shu yerga yo'naltiramiz. */
const firstAccessiblePath = (accountStore) =>
  navigations.find((v) => accountStore.canView(v.permission))?.path ?? AppPaths.Home

// 🔒 Ruxsat qo'riqchisi. Sidebar bilan AYNAN bir xil qoida (`canView`) qo'llanadi:
// bare slug YOKI uning '-read' varianti. `meta.permission` bo'lmasa (login, public
// sahifalar) bloklamaymiz — endi ichki route'lar otadan meros olgani uchun bu
// "hamma narsa ochiq" degani emas.
router.beforeEach(async (to, from, next) => {
  const permission = to.meta?.permission
  if (!permission) return next()

  const accountStore = useAccountStore()

  // ⚠️ Tartib muhim: vue-router'da global `beforeEach` route'ning `beforeEnter`idan
  // OLDIN ishlaydi, ya'ni profilni (va ruxsatlarni) yuklaydigan `beforeLogin` hali
  // chaqirilmagan. `sessionStorage` esa har tab uchun alohida — shu sababli YANGI
  // TABDA deep-link ochilganda ruxsatlar bo'sh bo'lib, qo'riqchi noto'g'ri rad etardi
  // va foydalanuvchi Home'ga uchib ketardi. Baholashdan oldin o'zimiz yuklaymiz.
  const token = localStorage.getItem(useAppSetting.tokenKey)
  if (token && !accountStore.permissionsLoaded) {
    // 401 bo'lsa axios interceptor Login'ga o'zi yo'naltiradi (service/index.js).
    await accountStore._index().catch(() => {})
  }

  if (accountStore.canView(permission)) return next()

  // `window.$Toast` ToastProvider mount bo'lganda paydo bo'ladi — ilk navigatsiyada
  // hali mavjud bo'lmasligi mumkin, shuning uchun ixtiyoriy chaqiruv.
  window.$Toast?.warning(i18n.global.t('message.noPermission'))

  // Cheksiz redirectdan saqlanish.
  const fallback = firstAccessiblePath(accountStore)
  if (to.path === fallback || to.path === AppPaths.Home) return next()
  next(fallback)
})

export default router
