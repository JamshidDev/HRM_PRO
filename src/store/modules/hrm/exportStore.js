import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"

export const useExportStore = defineStore('exportStore', {
    state:()=>({
        loading: false,
        visible: false,
        payload: {
            columns: []
        },
        columns: []
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
        resetPayload(){
            this.payload.columns = [];
        }
    },
})