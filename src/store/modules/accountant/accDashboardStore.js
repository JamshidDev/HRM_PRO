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
        dashboardLoading:false,

    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.taxFourService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _show(){
            this.showLoading = true
            $ApiService.taxFourService._show({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.showLoading = false
            })
        },
        _dashboard(){
            this.dashboardLoading = true
            $ApiService.accDashboardService._dashboard().then((res)=>{
                this.dashboardData = res.data.data
            }).finally(()=>{
                this.dashboardLoading = false
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