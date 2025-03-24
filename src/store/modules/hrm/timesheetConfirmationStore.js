import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import dayjs from "dayjs";

export const useTimesheetConfirmStore = defineStore('timesheetConfirmStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        visible:false,
        elementId:null,
        visibleLoading:false,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        payload:{
            confirmationObjects: [],
            mainUser: null
        }
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.timesheetConfirmService._index({id: this.elementId}).then((res)=>{
                this.list = res.data.data.confirmations
                this.payload.mainUser = res.data.data.confirmations.find(i=>i.main)?.id || null
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                confirmations: this.payload.confirmationObjects.map((i, idx)=>({
                    attach: true,
                    id: i,
                    order: idx+1,
                    main: false
                })),
            }

            $ApiService.timesheetConfirmService._create({data, id: this.elementId}).then((res)=>{
                this.resetForm()
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _update(v){
            this.loading = true
            $ApiService.timesheetConfirmService._create({
                data: {
                    confirmations: [v]
                }, id: this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.loading = false
            })
        },
        resetForm(){
            this.payload.confirmationObjects = []
            this.payload.mainUser = null
        }
    }
})