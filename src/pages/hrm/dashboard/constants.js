import AgeStructureCard from '@/pages/hrm/dashboard/ui/cards/AgeStructureCard.vue'
import BirthdayListCard from '@/pages/hrm/dashboard/ui/cards/BirthdayListCard.vue'
import EducationCard from '@/pages/hrm/dashboard/ui/cards/EducationCard.vue'
import DocumentStatusCard from '@/pages/hrm/dashboard/ui/cards/DocumentStatusCard.vue'
import ContractTypesCard from '@/pages/hrm/dashboard/ui/cards/ContractTypesCard.vue'
import HiringDynamicsCard from '@/pages/hrm/dashboard/ui/cards/HiringDynamicsCard.vue'
import DisabilityDonutCard from '@/pages/hrm/dashboard/ui/cards/DisabilityDonutCard.vue'
import VacationStatusCard from '@/pages/hrm/dashboard/ui/cards/VacationStatusCard.vue'
import SickLeaveCard from '@/pages/hrm/dashboard/ui/cards/SickLeaveCard.vue'
import IncentiveRadialCard from '@/pages/hrm/dashboard/ui/cards/IncentiveRadialCard.vue'
import PunishmentColumnCard from '@/pages/hrm/dashboard/ui/cards/PunishmentColumnCard.vue'

import AgeDetail from '@/pages/hrm/dashboard/ui/Detail/AgeDetail.vue'
import BirthdayDetail from '@/pages/hrm/dashboard/ui/Detail/BirthdayDetail.vue'
import EducationDetail from '@/pages/hrm/dashboard/ui/Detail/EducationDetail.vue'
import PassportDetail from '@/pages/hrm/dashboard/ui/Detail/PassportDetail.vue'
import MedDetail from '@/pages/hrm/dashboard/ui/Detail/MedDetail.vue'
import PensionDetail from '@/pages/hrm/dashboard/ui/Detail/PensionDetail.vue'
import ContractDetail from '@/pages/hrm/dashboard/ui/Detail/ContractDetail.vue'
import WorkerDisabilityDetail from '@/pages/hrm/dashboard/ui/Detail/WorkerDisabilityDetail.vue'
import RelativeDisabilityDetail from '@/pages/hrm/dashboard/ui/Detail/RelativeDisabilityDetail.vue'
import IncentiveDetail from '@/pages/hrm/dashboard/ui/Detail/IncentiveDetail.vue'
import DisciplinaryDetail from '@/pages/hrm/dashboard/ui/Detail/DisciplinaryDetail.vue'

import ApiService from '@/service/ApiService.js'

export const InfoCardEnum = {
  PASSPORT: 'passport',
  MED: 'med',
  PENSION: 'pension',
  DISCIPLINARY: 'disciplinary',
  INCENTIVE: 'incentive'
}

/**
 * Figma "HRM Dashboard — chart variantlari (v3)" (node 2959:58213) boblari.
 * `audit` — eski holida qoladi, shu sababli bu ro'yxatda yo'q.
 */
export const DashboardTab = {
  GENERAL: 'general',
  MOVEMENT: 'movement',
  ATTENDANCE: 'attendance',
  AUDIT: 'audit'
}

/**
 * Har bir bob uchun KPI qatorida chiziladigan kartalar (`dashboard.mainCard`
 * dagi `variant` bo'yicha tanlanadi). Maketda Kadrlar harakati bobida to'rtta
 * karta bor, ammo "vakansiya yopilish muddati" va "o'rtacha staj" uchun
 * backend ma'lumot bermaydi — shu sababli faqat ikkitasi qoladi.
 */
export const tabKpiVariants = {
  [DashboardTab.GENERAL]: ['users', 'pension', 'positions', 'fxsh'],
  [DashboardTab.MOVEMENT]: ['positions', 'pension'],
  [DashboardTab.ATTENDANCE]: []
}

/**
 * Boblar kontenti. Har bir yozuv `n-grid-item` span'i va (agar mavjud bo'lsa)
 * drill-down konfiguratsiyasini beradi — `page.vue` shu ma'lumot bilan
 * `store.activeDetail` ni to'ldiradi.
 */
export const tabCards = {
  [DashboardTab.GENERAL]: [
    {
      component: markRaw(AgeStructureCard),
      span: '12 l:6',
      title: 'dashboardPage.age.structureTitle',
      detail: markRaw(AgeDetail),
      filters: ['sex', 'ages'],
      filterCallback: ApiService.dashboardService._ageDetail
    },
    {
      component: markRaw(BirthdayListCard),
      span: '12 l:6',
      title: 'dashboardPage.birthday.title',
      detail: markRaw(BirthdayDetail),
      filters: ['birth_month', 'birth_day'],
      filterCallback: ApiService.dashboardService._birthdayDetail
    },
    {
      component: markRaw(EducationCard),
      span: '12',
      title: 'dashboardPage.edu.title',
      detail: markRaw(EducationDetail),
      filters: ['type'],
      filterCallback: ApiService.dashboardService._educationDetail
    },
    {
      component: markRaw(DocumentStatusCard),
      span: '12 md:6 l:4',
      props: { type: 'passport' },
      title: 'dashboardPage.password.title',
      detail: markRaw(PassportDetail),
      filters: ['filter'],
      filterCallback: ApiService.dashboardService._passportDetail
    },
    {
      component: markRaw(DocumentStatusCard),
      span: '12 md:6 l:4',
      props: { type: 'med' },
      title: 'dashboardPage.medical.title',
      detail: markRaw(MedDetail),
      filters: ['med_type'],
      filterCallback: ApiService.dashboardService._medDetail
    },
    {
      component: markRaw(DocumentStatusCard),
      span: '12 md:6 l:4',
      props: { type: 'pension' },
      title: 'dashboardPage.pension.title',
      detail: markRaw(PensionDetail),
      filters: ['sex'],
      filterCallback: ApiService.dashboardService._pensionDetail
    }
  ],

  [DashboardTab.MOVEMENT]: [
    {
      component: markRaw(ContractTypesCard),
      span: '12'
    },
    {
      component: markRaw(HiringDynamicsCard),
      span: '12',
      title: 'dashboardPage.yearly.title',
      detail: markRaw(ContractDetail),
      filters: ['contract_type', 'year', 'month'],
      filterCallback: ApiService.dashboardService._contractDetail,
      defaultValues: {
        type: 'ended',
        year: new Date().getFullYear(),
        month: new Date().getMonth() || 12
      }
    },
    {
      component: markRaw(DisabilityDonutCard),
      span: '12 l:6',
      props: { type: 'worker' },
      title: 'dashboardPage.disability.workerTitle',
      detail: markRaw(WorkerDisabilityDetail),
      filters: [],
      filterCallback: ApiService.dashboardService._workerDisabilityDetail
    },
    {
      component: markRaw(DisabilityDonutCard),
      span: '12 l:6',
      props: { type: 'relative' },
      title: 'dashboardPage.disability.relativeTitle',
      detail: markRaw(RelativeDisabilityDetail),
      filters: [],
      filterCallback: ApiService.dashboardService._relativeDisabilityDetail
    }
  ],

  [DashboardTab.ATTENDANCE]: [
    {
      component: markRaw(VacationStatusCard),
      span: '12 l:8'
    },
    {
      component: markRaw(SickLeaveCard),
      span: '12 l:4'
    },
    {
      component: markRaw(IncentiveRadialCard),
      span: '12 l:6',
      title: 'dashboardPage.incentive.title',
      detail: markRaw(IncentiveDetail),
      filters: ['year', 'inc_type'],
      filterCallback: ApiService.dashboardService._incentiveDetail
    },
    {
      component: markRaw(PunishmentColumnCard),
      span: '12 l:6',
      title: 'dashboardPage.disciplinary.title',
      detail: markRaw(DisciplinaryDetail),
      filters: ['year', 'disc_type'],
      filterCallback: ApiService.dashboardService._disciplinaryDetail
    }
  ]
}
