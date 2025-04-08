import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import examDashboardService from "@/service/v1/lms/examDashboardService.js";
const {t} = i18n.global

export const useExamDashboardService = defineStore('examDashboardService', {
    state:()=>({
        examStats:[],
        loading:false,
        elementId:null,
        params:{

        },
    }),
    actions:{
        _worker_statistics(){
            this.loading= true
            $ApiService.examDashboardService._worker_statistics({params:this.params}).then((res)=>{
                this.examStats = res.data.data
            }).finally(()=>{
                this.loading= false
            })
        },
    }
})