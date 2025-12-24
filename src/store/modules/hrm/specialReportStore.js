import { defineStore } from "pinia";

export const useSpecialReportStore = defineStore('specialReportStore', {
    state:()=>({
        list:[],
        loading:false,
        structureCheck: [],

        visible:false,
        saveLoading:false,
        payload:{
            organizations: [],
            type: undefined,
        }
    }),
    actions:{
        _getList(){
            this.loading = true
            $ApiService.specialReportService._get_report_export().then((res)=>{
                this.list = res.data.data
            }).finally(()=>{
                this.loading = false
            })
        },
        _exportRequest(){
            this.saveLoading = true
            const data = {
                type: this.payload.type,
                organizations: this.payload.organizations.map(v=>v.id).join(','),
            }
            $ApiService.specialReportService._post_report_export(data).then((res)=>{
                this.visible = false
            }).finally(()=>{
                this.saveLoading = false
            })
        }
    }

})