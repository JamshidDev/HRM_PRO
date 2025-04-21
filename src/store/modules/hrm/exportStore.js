import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"

export const useExportStore = defineStore('exportStore', {
    state:()=>({
        loading: false,
        visible: false,
        totalItems: 0,
        params: {
            page: 1,
            per_page: 10,
            search: null,
        },
        payload: {
            columns: []
        },
        columns: [],
        tasks: []
    }),
    actions:{
        _columns(){
            this.loading= true
            $ApiService.exportService._columns().then((res)=>{
                this.columns = res.data.data
            }).finally(()=>{
                this.loading= false
            })
        },
        _tasks(){
            this.loading= true
            $ApiService.exportService._tasks({params: this.params}).then((res)=>{
                this.tasks = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        resetPayload(){
            this.payload.columns = [];
        }
    },
})