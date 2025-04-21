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
        tasks: [],
        saveLoading: false,
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
        _export_workers(){
            this.saveLoading=true
            $ApiService.exportService._export_workers({data: this.payload.columns.map(i=>i.column)}).then((res)=>{
                this.visible = false
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        resetPayload(){
            this.payload.columns = [];
        }
    },
})