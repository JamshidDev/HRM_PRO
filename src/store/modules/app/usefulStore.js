import {defineStore} from "pinia";
import {useAppSetting} from "@/utils/index.js"

export const useUsefulStore = defineStore('usefulStore', {
    state:()=>({
        loading:false,
        visible: false,
        codex: null,
        leaders: [],
        structureModel: [],
        structureCheck: [],
        orgInstance: null,
    }),
    actions:{
        _codex(){
            this.loading = true
            $ApiService.usefulService._codex().then((res)=>{
                this.codex = res.data.data.codex
            }).finally(()=>{
                this.loading = false
            })
        },
        _leaders(){
            this.loading = true
            $ApiService.usefulService._leaders().then((res)=>{
                this.leaders = res.data.data
            }).finally(()=>{
                this.loading = false
            })
        }

    }

})