/**
 * ESKI («Eski» bobi) dashboard kartalari.
 *
 * Bu ro'yxat 6d400d69 («Figma v3 maketiga ko'ra uch bobli dashboard») dan
 * OLDINGI `constants.js` dan ko'chirildi. Yangi maketga o'tishda o'chirilgan
 * 10 ta grafik komponenti `ui/legacy/` da tiklandi, drill-down (`Detail/*`)
 * komponentlari esa hech qachon o'chirilmagan — ular umumiy.
 *
 * `InfoCardEnum` yangi `constants.js` da ham bor, shuning uchun takrorlanmadi.
 */
import DisabilityCard from './DisabilityCard.vue'
import WorkerDisabilityDetail from '../Detail/WorkerDisabilityDetail.vue'
import RelativeDisabilityDetail from '../Detail/RelativeDisabilityDetail.vue'
import AgeChart from './AgeChart.vue'
import AgeDetail from '../Detail/AgeDetail.vue'
import EduChart from './EduChart.vue'
import EducationDetail from '../Detail/EducationDetail.vue'
import IncentiveChart from './IncentiveChart.vue'
import YearlyChart from './YearlyChart.vue'
import BirthdayCard from './BirthdayCard.vue'
import BirthdayDetail from '../Detail/BirthdayDetail.vue'
import VacationChart from './VacationChart.vue'
import ContractChart from './ContractChart.vue'
import InfoCard from './InfoCard.vue'
import PassportDetail from '../Detail/PassportDetail.vue'
import PensionDetail from '../Detail/PensionDetail.vue'
import MedDetail from '../Detail/MedDetail.vue'
import IncentiveDetail from '../Detail/IncentiveDetail.vue'
import DisciplinaryDetail from '../Detail/DisciplinaryDetail.vue'
import ContractDetail from '../Detail/ContractDetail.vue'
import ApiService from '@/service/ApiService.js'

export const legacyCards = [
  {
    component: markRaw(AgeChart),
    span: '12 l:6 xl:4',
    title: 'dashboardPage.age.title',
    detail: markRaw(AgeDetail),
    filters: ['sex', 'ages'],
    filterCallback: ApiService.dashboardService._ageDetail
  },
  {
    component: markRaw(EduChart),
    span: '12 l:6 xl:4',
    title: 'dashboardPage.edu.title',
    detail: markRaw(EducationDetail),
    filters: ['type'],
    filterCallback: ApiService.dashboardService._educationDetail
  },
  {
    component: markRaw(IncentiveChart),
    span: '12 l:6 xl:4',
    detailFactory(v) {
      switch (v) {
        case InfoCardEnum.DISCIPLINARY:
          return {
            title: 'dashboardPage.disciplinary.title',
            detail: markRaw(DisciplinaryDetail),
            filters: ['year', 'disc_type'],
            filterCallback: ApiService.dashboardService._disciplinaryDetail
          }
        case InfoCardEnum.INCENTIVE:
          return {
            title: 'dashboardPage.incentive.title',
            detail: markRaw(IncentiveDetail),
            filters: ['year', 'inc_type'],
            filterCallback: ApiService.dashboardService._incentiveDetail
          }
      }
    }
  },
  {
    component: markRaw(YearlyChart),
    span: '12 l:6 xl:8',
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
    component: markRaw(BirthdayCard),
    span: '12 l:6 xl:4',
    title: 'dashboardPage.birthday.title',
    detail: markRaw(BirthdayDetail),
    filters: ['birth_month', 'birth_day'],
    filterCallback: ApiService.dashboardService._birthdayDetail
  },
  {
    component: markRaw(VacationChart),
    span: '12 l:6 xl:4'
  },
  {
    component: markRaw(ContractChart),
    span: '12 l:6 xl:4'
  },
  {
    component: markRaw(InfoCard),
    span: '12 l:6 xl:4',
    /**
     * That method is being written since the card in question has three different childs with respective details
     * Thus we needed a dynamic method to identify small card in question
     */
    detailFactory(v) {
      switch (v) {
        case InfoCardEnum.PASSPORT:
          return {
            title: 'dashboardPage.password.title',
            detail: markRaw(PassportDetail),
            filters: ['filter'],
            filterCallback: ApiService.dashboardService._passportDetail
          }
        case InfoCardEnum.MED:
          return {
            title: 'dashboardPage.medical.title',
            detail: markRaw(MedDetail),
            filters: ['med_type'],
            filterCallback: ApiService.dashboardService._medDetail
          }
        case InfoCardEnum.PENSION:
          return {
            title: 'dashboardPage.pension.title',
            detail: markRaw(PensionDetail),
            filters: ['sex'],
            filterCallback: ApiService.dashboardService._pensionDetail
          }
      }
    }
  },
  {
    component: markRaw(DisabilityCard),
    span: '12 l:4 xl:4',
    props: { type: 'worker' },
    title: 'dashboardPage.disability.workerTitle',
    detail: markRaw(WorkerDisabilityDetail),
    filters: [],
    filterCallback: ApiService.dashboardService._workerDisabilityDetail
  },
  {
    component: markRaw(DisabilityCard),
    span: '12 l:4 xl:4',
    props: { type: 'relative' },
    title: 'dashboardPage.disability.relativeTitle',
    detail: markRaw(RelativeDisabilityDetail),
    filters: [],
    filterCallback: ApiService.dashboardService._relativeDisabilityDetail
  },
  {
    component: markRaw(DisabilityCard),
    span: '12 l:4 xl:4',
    props: { type: 'sickLeave' }
  }
]
