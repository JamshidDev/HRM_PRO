import AgeChart from "@/pages/hrm/dashboardV3/ui/AgeChart.vue"
import AgeDetail from "@/pages/hrm/dashboardV3/ui/Detail/AgeDetail.vue"
import EduChart from "@/pages/hrm/dashboardV3/ui/EduChart.vue"
import EducationDetail from "@/pages/hrm/dashboardV3/ui/Detail/EducationDetail.vue"
import IncentiveChart from "@/pages/hrm/dashboardV3/ui/IncentiveChart.vue"
import YearlyChart from "@/pages/hrm/dashboardV3/ui/YearlyChart.vue"
import BirthdayCard from "@/pages/hrm/dashboardV3/ui/BirthdayCard.vue"
import BirthdayDetail from "@/pages/hrm/dashboardV3/ui/Detail/BirthdayDetail.vue"
import VacationChart from "@/pages/hrm/dashboardV3/ui/VacationChart.vue"
import ContractChart from "@/pages/hrm/dashboardV3/ui/ContractChart.vue"
import InfoCard from "@/pages/hrm/dashboardV3/ui/InfoCard.vue"
import PassportDetail from "@/pages/hrm/dashboardV3/ui/Detail/PassportDetail.vue"
import PensionDetail from "@/pages/hrm/dashboardV3/ui/Detail/PensionDetail.vue"

import ApiService from "@/service/ApiService.js";

export const InfoCardEnum = {
    PASSPORT: 'passport',
    MED: 'med',
    PENSION: 'pension'
}

export const cards = [
    {
        component: markRaw(AgeChart),
        span: "12 l:6 xl:4",
        title: 'dashboardPage.age.title',
        detail: markRaw(AgeDetail),
        filters: ["sex", "ages"],
        filterCallback: ApiService.dashboardService._ageDetail
    },
    {
        component: markRaw(EduChart),
        span: "12 l:6 xl:4",
        title: 'dashboardPage.edu.title',
        detail: markRaw(EducationDetail),
        filters: ["type"],
        filterCallback: ApiService.dashboardService._educationDetail
    },
    {
        component: markRaw(IncentiveChart),
        span: "12 l:6 xl:4"
    },
    {
        component: markRaw(YearlyChart),
        span: "12 l:6 xl:8"
    },
    {
        component: markRaw(BirthdayCard),
        span: "12 l:6 xl:4",
        title: 'dashboardPage.birthday.title',
        detail: markRaw(BirthdayDetail),
        filters: ["birth_month", "birth_day"],
        filterCallback: ApiService.dashboardService._birthdayDetail
    },
    {
        component: markRaw(VacationChart),
        span: "12 l:6 xl:4"
    },
    {
        component: markRaw(ContractChart),
        span: "12 l:6 xl:4"
    },
    {
        component: markRaw(InfoCard),
        span: "12 l:6 xl:4",
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
                        filters: ["filter"],
                        filterCallback: ApiService.dashboardService._passportDetail
                    }
                case InfoCardEnum.PENSION:
                    return {
                        title: 'dashboardPage.pension.title',
                        detail: markRaw(PensionDetail),
                        filters: ["sex"],
                        filterCallback: ApiService.dashboardService._pensionDetail
                    }
            }
        }
    },
]