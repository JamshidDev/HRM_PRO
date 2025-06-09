import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useDashboardStore = defineStore('dashboardStore', {
    state: () => ({
        structureModel: [],
        structureCheck: [],
        loading: false,
        activeDetail: null,
        payload: {
            pin: null,
            position: null,
        },
        defaultParams: {
            page: 1,
            per_page: 10,
            search: null,
            age_start: 1,
            age_end: 100,
            ages: [1, 100],
            sex: null,
            type: null,
            birth_day: new Date().getDate(),
            birth_month: new Date().getMonth() + 1,
            // Passport state filter possible values were: expired, approaching, not_included
            filter: null,
        },
        params: {
            organizations: [],
            page: 1,
            per_page: 10,
            search: null,
            age_start: 1,
            age_end: 100,
            ages: [1, 100],
            sex: null,
            type: null,
            birth_day: null,
            birth_month: null,
            filter: null,
        },
        detailData: null,
        detailDataTotal: 0,
        detailLoading: false,
        dashboard: {
            contractTypes: [],
            mainCard: [],
            ageCard: [],
            eduCard: [],
            passwordCard: null,
            pensionCard: null,
            medicalCard: null,
            contracts: [],
            birthdays: null,
            vacations: [],
        },
    }),
    actions: {
        _index(update) {
            this.loading = true
            let params = {}
            if(update){
                params.cache = "update"
            }
            params = this.appendParams(params)

            $ApiService.dashboardService._index({params}).then((res) => {
                const formatMonth = (date) => {
                    let day = date.split('-')[1]
                    let month = Utils.getMonthNameByKey(date.split('-')[0])
                    return `${day} - ${month}`
                }

                const v = res.data.data
                this.dashboard.contractTypes = v.contract_types
                this.dashboard.mainCard = [
                    {
                        total: {
                            title: 'dashboardPage.mainCard.totalWorker',
                            count: v.workers_count,
                        },
                        data1: {
                            title: 'dashboardPage.mainCard.man',
                            count: v.mans_count,
                        },
                        data2: {
                            title: 'dashboardPage.mainCard.woman',
                            count: v.woman_count,
                        },
                    },
                    {
                        total: {
                            title: 'dashboardPage.pension.title',
                            count: v.retired_men_count + v.retired_women_count,
                        },
                        data1: {
                            title: 'dashboardPage.pension.men',
                            count: v.retired_men_count,
                        },
                        data2: {
                            title: 'dashboardPage.pension.women',
                            count: v.retired_women_count,
                        },
                    },
                    {
                        total: {
                            title: 'dashboardPage.position.title',
                            count: v.positions_rate,
                        },
                        data1: {
                            title: 'dashboardPage.position.vakant',
                            count: Math.max(v.positions_rate - v.worker_positions_rate, 0)
                        },
                        data2: {
                            title: 'dashboardPage.position.sverx',
                            count: Math.max(v.worker_positions_rate - v.positions_rate, 0)
                        }
                    },
                    {
                        total: {
                            title: 'dashboardPage.mainCard.totalWorker',
                            count: v.workers_count,
                        },
                        data1: {
                            title: 'dashboardPage.mainCard.man',
                            count: v.mans_count,
                        },
                        data2: {
                            title: 'dashboardPage.mainCard.woman',
                            count: v.woman_count,
                        },
                    },
                ]
                this.dashboard.ageCard = [
                    {
                        title: 'dashboardPage.age.age31',
                        count: v.age_30_and_younger,
                    },
                    {
                        title: 'dashboardPage.age.age32_45',
                        count: v.age_31_to_45,
                    },
                    {
                        title: 'dashboardPage.age.age46',
                        count: v.age_46_and_older,
                    },
                ]
                this.dashboard.eduCard = [
                    {
                        title: 'dashboardPage.edu.higher',
                        count: v.higher_edu_count,
                    },
                    {
                        title: 'dashboardPage.edu.middle',
                        count: v.middle_edu_count,
                    },
                    {
                        title: 'dashboardPage.edu.special',
                        count: v.special_edu_count,
                    },
                ]
                this.dashboard.passwordCard = {
                    title: 'dashboardPage.password.title',
                    data: [
                        {
                            title: 'dashboardPage.password.deadline',
                            count: v.passports_count,
                        },
                        {
                            title: 'dashboardPage.password.expired',
                            count: v.passports_more_count,
                        },
                    ],
                }
                this.dashboard.pensionCard = {
                    title: 'dashboardPage.pension.title',
                    data: [
                        {
                            title: 'dashboardPage.pension.men',
                            count: v.retired_men_count,
                        },
                        {
                            title: 'dashboardPage.pension.women',
                            count: v.retired_women_count,
                        },
                    ],
                }
                this.dashboard.medicalCard = {
                    title: 'dashboardPage.medical.title',
                    data: [
                        {
                            title: 'dashboardPage.medical.deadline',
                            count: 0,
                        },
                        {
                            title: 'dashboardPage.medical.expired',
                            count: 0,
                        },
                    ],
                }
                this.dashboard.contracts = v.contracts
                this.dashboard.vacations = v.vacation_types
                if (v.birthdays.result.length > 0) {
                    this.dashboard.birthdays = {
                        title: "dashboardPage.birthday.title",
                        data: [
                            {
                                title: t("dashboardPage.birthday.today"),
                                workers: v.birthdays.result[0]?.count > 3 ? [...v.birthdays.result[0].workers, ...v.birthdays.result[0].workers] : v.birthdays.result[0].workers,
                                total: v.birthdays.result[0].count,
                                has_more: v.birthdays.result[0].has_more,
                            },
                            {
                                title: t("dashboardPage.birthday.tomorrow"),
                                workers: v.birthdays.result[1].count > 3 ? [...v.birthdays.result[1].workers, ...v.birthdays.result[1].workers] : v.birthdays.result[1].workers,
                                total: v.birthdays.result[1].count,
                                has_more: v.birthdays.result[1].has_more,
                            },
                            {
                                title: formatMonth(v.birthdays.result[2].day),
                                workers: v.birthdays.result[2].count > 3 ? [...v.birthdays.result[2].workers, ...v.birthdays.result[2].workers] : v.birthdays.result[2].workers,
                                total: v.birthdays.result[2].count,
                                has_more: v.birthdays.result[2].has_more,
                            },
                            {
                                title: formatMonth(v.birthdays.result[3].day),
                                workers: v.birthdays.result[3].count > 3 ? [...v.birthdays.result[3].workers, ...v.birthdays.result[3].workers] : v.birthdays.result[3].workers,
                                total: v.birthdays.result[3].count,
                                has_more: v.birthdays.result[3].has_more,
                            },
                            {
                                title: formatMonth(v.birthdays.result[4]?.day),
                                workers: v.birthdays.result[4].count > 3 ? [...v.birthdays.result[4].workers, ...v.birthdays.result[4].workers] : v.birthdays.result[4].workers,
                                total: v.birthdays.result[4].count,
                                has_more: v.birthdays.result[4].has_more,
                            },
                        ]
                    }
                }


            }).finally(() => {
                this.loading = false
            })
        },
        _index_detail(){
            if(!this.activeDetail?.filterCallback) throw new Error("No detail filter callback set")
            this.detailLoading = true
            let params = {
                page: this.params.page,
                per_page: this.params.per_page,
            }
            this.activeDetail.filters.map(i=>{
                if(i==='ages'){
                    params.age_start = this.params.age_start
                    params.age_end = this.params.age_end
                }else{
                    params[i] = this.params[i]
                }
            })
            params = this.appendParams(params)
            this.activeDetail?.filterCallback({params}).then((res) => {
                this.detailData = res.data.data.data
                this.detailDataTotal = res.data.data.total
            }).finally(() => {
                this.detailLoading = false
            })
        },
        _birthdayDetail() {

        },
        _ageDetail() {
        },

        _show() {
            this.loading = true
            $ApiService.workerService._index({id: this.elementId}).then((res) => {
                console.log(res.data.data)
            }).finally(() => {
                this.loading = false
            })
        },
        _create() {
            this.saveLoading = true
            let data = {
                uuid: this.payload.pin,
                position: this.payload.position,
            }
            $ApiService.confirmationService._create({data}).then((res) => {
                this.visible = false
                this._index()

            }).finally(() => {
                this.saveLoading = false
            })
        },
        _update() {
            this.saveLoading = true
            let data = {
                uuid: this.payload.pin,
                position: this.payload.position,
            }
            $ApiService.confirmationService._update({data, id: this.elementId}).then((res) => {
                this.visible = false
                this._index()

            }).finally(() => {
                this.saveLoading = false
            })
        },
        _delete() {
            this.deleteLoading = true
            $ApiService.confirmationService._delete({id: this.elementId}).then((res) => {
                this._index()

            }).finally(() => {
                this.deleteLoading = false
            })
        },
        // Helper for appending parent params to other children
        appendParams(params) {
            return {
                ...params,
                organizations: this.params.organizations.length ? this.params.organizations.map(i => i.id).join(',') : undefined
            }
        },
        resetDetailData() {
            this.params = {
                ...this.params,
                ...this.defaultParams
            }

            this.detailData = null
            this.detailDataTotal = 0
        },
        openVisible(data) {
            this.visible = data
        },
        resetForm() {
            this.elementId = null
            this.payload.pin = null
            this.payload.position = null
        }

    }

})