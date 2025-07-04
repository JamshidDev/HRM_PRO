import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useMonthReportStore = defineStore('monthReportStore', {
    state:()=>({
        list:[],
        loading:false,
        showLoading:false,
        deleteLoading:false,
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
        showList:[],
        showPrams:{
            year:null,
            month:null,
        }

    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.monthReportService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _show(){
            this.showLoading = true
            let params = {
                year:this.showPrams.year,
                month:this.showPrams.month,
            }
            let id = this.elementId
            $ApiService.monthReportService._show({params, id}).then((res)=>{
                this.showList = res.data.data
            }).finally(()=>{
                this.showLoading = false
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