import AgeChart from '@/pages/hrm/dashboard/ui/AgeChart.vue'
import AgeDetail from '@/pages/hrm/dashboard/ui/Detail/AgeDetail.vue'
import EduChart from '@/pages/hrm/dashboard/ui/EduChart.vue'
import EducationDetail from '@/pages/hrm/dashboard/ui/Detail/EducationDetail.vue'
import IncentiveChart from '@/pages/hrm/dashboard/ui/IncentiveChart.vue'
import YearlyChart from '@/pages/hrm/dashboard/ui/YearlyChart.vue'
import BirthdayCard from '@/pages/hrm/dashboard/ui/BirthdayCard.vue'
import BirthdayDetail from '@/pages/hrm/dashboard/ui/Detail/BirthdayDetail.vue'
import VacationChart from '@/pages/hrm/dashboard/ui/VacationChart.vue'
import ContractChart from '@/pages/hrm/dashboard/ui/ContractChart.vue'
import InfoCard from '@/pages/hrm/dashboard/ui/InfoCard.vue'
import PassportDetail from '@/pages/hrm/dashboard/ui/Detail/PassportDetail.vue'
import PensionDetail from '@/pages/hrm/dashboard/ui/Detail/PensionDetail.vue'
import MedDetail from '@/pages/hrm/dashboard/ui/Detail/MedDetail.vue'
import IncentiveDetail from '@/pages/hrm/dashboard/ui/Detail/IncentiveDetail.vue'
import DisciplinaryDetail from '@/pages/hrm/dashboard/ui/Detail/DisciplinaryDetail.vue'
import ContractDetail from '@/pages/hrm/dashboard/ui/Detail/ContractDetail.vue'

import ApiService from '@/service/ApiService.js'

export const InfoCardEnum = {
  PASSPORT: 'passport',
  MED: 'med',
  PENSION: 'pension',
  DISCIPLINARY: 'disciplinary',
  INCENTIVE: 'incentive'
}

export const cards = [
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
  }
]
