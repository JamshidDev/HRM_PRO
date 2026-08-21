import AgeStructureCard from '@/pages/hrm/dashboard/ui/cards/AgeStructureCard.vue'
import BirthdayListCard from '@/pages/hrm/dashboard/ui/cards/BirthdayListCard.vue'
import EducationCard from '@/pages/hrm/dashboard/ui/cards/EducationCard.vue'
import DocumentStatusCard from '@/pages/hrm/dashboard/ui/cards/DocumentStatusCard.vue'
import HeadcountTrendCard from '@/pages/hrm/dashboard/ui/cards/HeadcountTrendCard.vue'
import TodayStatusCard from '@/pages/hrm/dashboard/ui/cards/TodayStatusCard.vue'
import NationalityWaffleCard from '@/pages/hrm/dashboard/ui/cards/NationalityWaffleCard.vue'
import HiringByContractCard from '@/pages/hrm/dashboard/ui/cards/HiringByContractCard.vue'
import DismissalTreemapCard from '@/pages/hrm/dashboard/ui/cards/DismissalTreemapCard.vue'
import StaffVsActualCard from '@/pages/hrm/dashboard/ui/cards/StaffVsActualCard.vue'
import OpenVacanciesCard from '@/pages/hrm/dashboard/ui/cards/OpenVacanciesCard.vue'
import VacancyAgeCard from '@/pages/hrm/dashboard/ui/cards/VacancyAgeCard.vue'
import UpcomingEventsCard from '@/pages/hrm/dashboard/ui/cards/UpcomingEventsCard.vue'
import RetentionCohortCard from '@/pages/hrm/dashboard/ui/cards/RetentionCohortCard.vue'
import HiringDynamicsCard from '@/pages/hrm/dashboard/ui/cards/HiringDynamicsCard.vue'
import DisabilityDonutCard from '@/pages/hrm/dashboard/ui/cards/DisabilityDonutCard.vue'
import VacationStatusCard from '@/pages/hrm/dashboard/ui/cards/VacationStatusCard.vue'
import SickLeaveCard from '@/pages/hrm/dashboard/ui/cards/SickLeaveCard.vue'
import IncentiveVsDisciplineCard from '@/pages/hrm/dashboard/ui/cards/IncentiveVsDisciplineCard.vue'
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
import MockDetail from '@/pages/hrm/dashboard/ui/Detail/MockDetail.vue'

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
 * `audit` — eski holida qoladi, shu sababli `tabCards` ro'yxatida yo'q.
 */
export const DashboardTab = {
  GENERAL: 'general',
  MOVEMENT: 'movement',
  ATTENDANCE: 'attendance',
  AUDIT: 'audit'
}

/**
 * Har bir bobda KPI qatorida chiziladigan kartalar soni — `kpi.js`
 * qaytaradigan ro'yxat shu tartibda keladi. `page.vue` faqat span'ni
 * hisoblash uchun uzunlikdan foydalanadi.
 */
export const tabKpiCount = {
  [DashboardTab.GENERAL]: 4,
  [DashboardTab.MOVEMENT]: 4,
  [DashboardTab.ATTENDANCE]: 3
}

/**
 * Boblar kontenti. `span` maketdagi karta kengligiga mos:
 * 1104px → `'12'`, 774px → `'12 l:8'`, 544px → `'12 l:6'`, 320px → `'12 l:4'`.
 *
 * Drill-down ikki xil bo'ladi:
 *   • `filterCallback` — haqiqiy endpoint (`filters` orqali filtr qatori)
 *   • `mockKey` — endpoint hali yo'q, jadval `mock.js` dan chiziladi
 */
export const tabCards = {
  [DashboardTab.GENERAL]: [
    {
      component: markRaw(HeadcountTrendCard),
      span: '12',
      title: 'dashboardPage.headcount.title',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'headcount_trend'
    },
    {
      component: markRaw(TodayStatusCard),
      span: '12 l:6',
      title: 'dashboardPage.today.title',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'today_status'
    },
    {
      component: markRaw(AgeStructureCard),
      span: '12 l:6',
      title: 'dashboardPage.age.structureTitle',
      detail: markRaw(AgeDetail),
      filters: ['sex', 'ages'],
      filterCallback: ApiService.dashboardService._ageDetail
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
      component: markRaw(NationalityWaffleCard),
      span: '12 l:6',
      title: 'dashboardPage.nationality.title',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'nationality'
    },
    {
      component: markRaw(BirthdayListCard),
      span: '12 l:6',
      title: 'dashboardPage.birthday.title',
      detail: markRaw(BirthdayDetail),
      filters: ['birth_month', 'birth_day'],
      filterCallback: ApiService.dashboardService._birthdayDetail
    },

    // Maketning v3 versiyasida bu uch karta "Ma'lumot sifati" bobiga
    // ko'chirilgan (u bob hozircha ishlanmagan). Haqiqiy ma'lumot va ishlayotgan
    // drill-down (pasport tahriri ham) yo'qolmasligi uchun shu yerda qoldirildi.
    {
      component: markRaw(DocumentStatusCard),
      span: '12 m:6 l:4',
      props: { type: 'passport' },
      title: 'dashboardPage.password.title',
      detail: markRaw(PassportDetail),
      filters: ['filter'],
      filterCallback: ApiService.dashboardService._passportDetail
    },
    {
      component: markRaw(DocumentStatusCard),
      span: '12 m:6 l:4',
      props: { type: 'med' },
      title: 'dashboardPage.medical.title',
      detail: markRaw(MedDetail),
      filters: ['med_type'],
      filterCallback: ApiService.dashboardService._medDetail
    },
    {
      component: markRaw(DocumentStatusCard),
      span: '12 m:6 l:4',
      props: { type: 'pension' },
      title: 'dashboardPage.pension.title',
      detail: markRaw(PensionDetail),
      filters: ['sex'],
      filterCallback: ApiService.dashboardService._pensionDetail
    }
  ],

  [DashboardTab.MOVEMENT]: [
    {
      component: markRaw(HiringByContractCard),
      span: '12 l:6',
      title: 'dashboardPage.hiring.title',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'hiring'
    },
    {
      component: markRaw(DismissalTreemapCard),
      span: '12 l:6',
      title: 'dashboardPage.dismissal.title',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'dismissal'
    },
    {
      component: markRaw(StaffVsActualCard),
      span: '12',
      title: 'dashboardPage.staffFact.title',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'staff_vs_actual'
    },
    {
      component: markRaw(OpenVacanciesCard),
      span: '12 l:6',
      title: 'dashboardPage.vacancy.openTitle',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'open_vacancies'
    },
    {
      component: markRaw(VacancyAgeCard),
      span: '12 l:6',
      title: 'dashboardPage.vacancy.ageTitle',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'vacancy_age'
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
    },
    {
      component: markRaw(UpcomingEventsCard),
      span: '12',
      title: 'dashboardPage.events.title',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'upcoming_events'
    },
    {
      component: markRaw(RetentionCohortCard),
      span: '12',
      title: 'dashboardPage.retention.title',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'retention'
    },

    // Maketning v3 versiyasida oylik qabul/bo'shatish grafigi yo'q, ammo u
    // haqiqiy ma'lumot bilan ishlaydi va o'z drill-down'i bor — shu sababli
    // bob oxirida qoldirildi.
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
    }
  ],

  [DashboardTab.ATTENDANCE]: [
    {
      component: markRaw(VacationStatusCard),
      span: '12 l:8',
      title: 'dashboardPage.vacation.statusTitle',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'vacation_by_department'
    },
    {
      component: markRaw(SickLeaveCard),
      span: '12 l:4',
      title: 'dashboardPage.disability.sickLeaveTitle',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'sick_leaves'
    },
    {
      component: markRaw(IncentiveVsDisciplineCard),
      span: '12',
      title: 'dashboardPage.monthly.title',
      detail: markRaw(MockDetail),
      filters: [],
      mockKey: 'incentive_monthly'
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
