import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useAccDashboardStore = defineStore('accDashboardStore', {
    state:()=>({
        list:[],
        loading:false,
        showLoading:false,
        downloadLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        payload:{
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
            year:null,
            month:null,
        },
        structureCheck2:[],
        dashboardData:null,
        cards:[],
        dashboardLoading:false,

    }),
    actions:{
        _index(){
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            this.loading = true
            $ApiService.accDashboardService._dashboard({params}).then((res)=>{
                this.dashboardData = res.data.data
                const data =res.data.data.last_month
                this.cards = [
                    {
                        name:'accDashboard.chart.statements',
                        data:data.statement.filter((_,index)=>index<3).map((v)=>({
                            name:`accDashboard.chart.${v.key }`,
                            count:v.value,
                        }))
                    },
                    {
                        name:'accDashboard.chart.tax_five',
                        data:data.tax_five.map((v)=>({
                            name:`accDashboard.tax_five.${v.key }`,
                            count:v.value,
                        }))
                    },
                    {
                        name:'accDashboard.chart.tax_four',
                        data:data.tax_four.map((v)=>({
                            name:`accDashboard.chart.${v.key }`,
                            count:v.value,
                        }))
                    },
                    {
                        name:'accDashboard.chart.pension_payment',
                        data:data.pension_payment.map((v)=>({
                            name:`accDashboard.chart.${v.key }`,
                            count:v.value,
                        }))
                    },
                ]
            }).finally(()=>{
                this.loading = false
            })
        },

        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.elementId = null
            this.payload.name = null
        }

    }

})