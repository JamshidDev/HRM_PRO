import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import dayjs from "dayjs";

export const useTimeSheetConfirmStore = defineStore('timesheetConfirmStore', {
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
        }
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.timesheetConfirmService._index({id: this.elementId}).then((res)=>{
                this.list = res.data.data.confirmations
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
        // _update(){
        //     this.saveLoading = true
        //     const date = dayjs(this.payload.timestamp)
        //     let data = {
        //         ...this.payload,
        //         month: date.month()+1,
        //         year: date.year(),
        //     }
        //     $ApiService.timeSheetService._update({data, id: this.elementId}).then((res)=>{
        //         this.visible = false
        //         this._index()
        //         this.resetForm()
        //     }).finally(()=>{
        //         this.saveLoading = false
        //     })
        // },
        resetForm(){
            this.payload.confirmationObjects = []
        }
    }
})