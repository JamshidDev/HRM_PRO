import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useDashboardStore = defineStore('dashboardStore', {
    state:()=>({
        structureModel: [],
        structureCheck: [],
        loading:false,
        activeDetail: null,
        payload:{
            pin:null,
            position:null,
        },
        params:{
            organizations: []
        },
        dashboard:{
            contractTypes:[],
            mainCard:[],
            ageCard:[],
            eduCard:[],
            passwordCard:null,
            pensionCard:null,
            medicalCard:null,
            contracts:[],
            birthdays:null,
            vacations:[],
        },
        detail:{
            birthdays: [],
            birthdaysLoading: false,
            birthdayParams: {
                birth_month: 1,
                birth_day: 1,
                page:1,
                per_page:10,
                search:null,
            },
            birthdaysTotal: 0,
            ages: [],
            agesLoading: false,
            ageParams: {
                page:1,
                per_page:10,
                age_start: 1,
                age_end: 100,
                ages:[1,100],
                sex: null
            },
            agesTotal: 0,
            educationList: [],
            educationListLoading: false,
            educationListParams: {
                page:1,
                per_page:10,
                type: null
            },
            educationListTotal: 0
        }

    }),
    actions:{
        _index(){
            this.loading= true
            const params = {}
            $ApiService.dashboardService._index({params}).then((res)=>{
                const formatMonth = (date)=>{
                    let day = date.split('-')[1]
                    let month = Utils.getMonthNameByKey(date.split('-')[0])
                    return `${day} - ${month}`
                }

                const v = res.data.data
                this.dashboard.contractTypes = v.contract_types
                this.dashboard.mainCard = [
                    {
                        total:{
                            title:'dashboardPage.mainCard.totalWorker',
                            count:v.workers_count,
                        },
                        data1:{
                            title:'dashboardPage.mainCard.man',
                            count:v.mans_count,
                        },
                        data2:{
                            title:'dashboardPage.mainCard.woman',
                            count:v.woman_count,
                        },
                    },
                    {
                        total:{
                            title:'dashboardPage.pension.title',
                            count:v.retired_men_count + v.retired_women_count,
                        },
                        data1:{
                            title:'dashboardPage.pension.men',
                            count:v.retired_men_count,
                        },
                        data2:{
                            title:'dashboardPage.pension.women',
                            count:v.retired_women_count,
                        },
                    },
                    {
                        total:{
                            title:'dashboardPage.position.title',
                            count:v.positions_rate,
                        },
                        data1:{
                            title:'dashboardPage.position.vakant',
                            count:Math.max(v.positions_rate - v.worker_positions_rate, 0)
                        },
                        data2: {
                            title: 'dashboardPage.position.sverx',
                            count: Math.max(v.worker_positions_rate - v.positions_rate, 0)
                        }
                    },
                    {
                        total:{
                            title:'dashboardPage.mainCard.totalWorker',
                            count:v.workers_count,
                        },
                        data1:{
                            title:'dashboardPage.mainCard.man',
                            count:v.mans_count,
                        },
                        data2:{
                            title:'dashboardPage.mainCard.woman',
                            count:v.woman_count,
                        },
                    },
                ]
                this.dashboard.ageCard = [
                    {
                        title:'dashboardPage.age.age31',
                        count:v.age_31_and_younger,
                    },
                    {
                        title:'dashboardPage.age.age32_45',
                        count:v.age_32_to_45,
                    },
                    {
                        title:'dashboardPage.age.age46',
                        count:v.age_46_and_older,
                    },
                ]
                this.dashboard.eduCard = [
                    {
                        title:'dashboardPage.edu.higher',
                        count:v.higher_edu_count,
                    },
                    {
                        title:'dashboardPage.edu.middle',
                        count:v.middle_edu_count,
                    },
                    {
                        title:'dashboardPage.edu.special',
                        count:v.special_edu_count,
                    },
                ]
                this.dashboard.passwordCard ={
                    title:'dashboardPage.password.title',
                    data:[
                        {
                            title:'dashboardPage.password.deadline',
                            count:v.passports_count,
                        },
                        {
                            title:'dashboardPage.password.expired',
                            count:v.passports_more_count,
                        },
                    ],
                }
                this.dashboard.pensionCard ={
                    title:'dashboardPage.pension.title',
                    data:[
                        {
                            title:'dashboardPage.pension.men',
                            count:v.retired_men_count,
                        },
                        {
                            title:'dashboardPage.pension.women',
                            count:v.retired_women_count,
                        },
                    ],
                }
                this.dashboard.medicalCard ={
                    title:'dashboardPage.medical.title',
                    data:[
                        {
                            title:'dashboardPage.medical.deadline',
                            count:0,
                        },
                        {
                            title:'dashboardPage.medical.expired',
                            count:0,
                        },
                    ],
                }
                this.dashboard.contracts =v.contracts
                this.dashboard.vacations =v.vacation_types
                if(v.birthdays.result.length>0){
                    this.dashboard.birthdays = {
                        title:"dashboardPage.birthday.title",
                        data:[
                            {
                                title:t("dashboardPage.birthday.today"),
                                workers:v.birthdays.result[0]?.count>3? [...v.birthdays.result[0].workers, ...v.birthdays.result[0].workers] : v.birthdays.result[0].workers,
                                total:v.birthdays.result[0].count,
                                has_more:v.birthdays.result[0].has_more,
                            },
                            {
                                title:t("dashboardPage.birthday.tomorrow"),
                                workers:v.birthdays.result[1].count>3? [...v.birthdays.result[1].workers, ...v.birthdays.result[1].workers] : v.birthdays.result[1].workers,
                                total:v.birthdays.result[1].count,
                                has_more:v.birthdays.result[1].has_more,
                            },
                            {
                                title:formatMonth(v.birthdays.result[2].day),
                                workers:v.birthdays.result[2].count>3? [...v.birthdays.result[2].workers, ...v.birthdays.result[2].workers] : v.birthdays.result[2].workers,
                                total:v.birthdays.result[2].count,
                                has_more:v.birthdays.result[2].has_more,
                            },
                            {
                                title:formatMonth(v.birthdays.result[3].day),
                                workers:v.birthdays.result[3].count>3? [...v.birthdays.result[3].workers, ...v.birthdays.result[3].workers] : v.birthdays.result[3].workers,
                                total:v.birthdays.result[3].count,
                                has_more:v.birthdays.result[3].has_more,
                            },
                            {
                                title:formatMonth(v.birthdays.result[4]?.day),
                                workers:v.birthdays.result[4].count>3? [...v.birthdays.result[4].workers, ...v.birthdays.result[4].workers] : v.birthdays.result[4].workers,
                                total:v.birthdays.result[4].count,
                                has_more:v.birthdays.result[4].has_more,
                            },
                        ]
                    }
                }


            }).finally(()=>{
                this.loading= false
            })
        },
        _birthdayDetail(){
            this.detail.birthdaysLoading= true
            const params = this.appendParams({
                ...this.detail.birthdayParams
            })
            $ApiService.dashboardService._birthdayDetail({params}).then((res)=>{
                this.detail.birthdays = res.data.data.data
                this.detail.birthdaysTotal = res.data.data.total
            }).finally(()=>{
                this.detail.birthdaysLoading= false
            })
        },
        _ageDetail(){
            this.detail.agesLoading= true
            const params = this.appendParams({
                ...this.detail.ageParams
            })
            $ApiService.dashboardService._ageDetail({params}).then((res)=>{
                this.detail.ages = res.data.data.data
                this.detail.agesTotal = res.data.data.total
            }).finally(()=>{
                this.detail.agesLoading= false
            })
        },
        _educationDetail(){
            this.detail.educationListLoading= true
            const params = this.appendParams({
                ...this.detail.educationListParams
            })
            $ApiService.dashboardService._ageDetail({params}).then((res)=>{
                this.detail.educationList = res.data.data.data
                this.detail.educationListTotal = res.data.data.total
            }).finally(()=>{
                this.detail.educationListLoading = false
            })
        },
        _show(){
            this.loading= true
            $ApiService.workerService._index({id:this.elementId}).then((res)=>{
                console.log(res.data.data)
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                uuid:this.payload.pin,
                position:this.payload.position,
            }
            $ApiService.confirmationService._create({data}).then((res)=>{
                this.visible = false
                this._index()

            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            let data = {
                uuid:this.payload.pin,
                position:this.payload.position,
            }
            $ApiService.confirmationService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()

            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.confirmationService._delete({id:this.elementId}).then((res)=>{
                this._index()

            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        // Helper for appending parent params to other children
        appendParams(params){
            return {
                ...params,
                organizations: this.params.organizations.length ? this.params.organizations.map(i=>i.id).join(',') : undefined
            }
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.elementId = null
            this.payload.pin = null
            this.payload.position = null
        }

    }

})