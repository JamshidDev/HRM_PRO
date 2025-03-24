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
            confirmations: [],
            confirmationObjects: [],
            mainUser: null
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
                    id: i.id,
                    order: idx+1,
                    main: this.payload.mainUser === i.id,
                })),
            }

            $ApiService.timesheetConfirmService._create({data, id: this.elementId}).then((res)=>{
                this.resetForm()
                this.visible = false
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
        _delete(v){
            this.loading = true
            $ApiService.timesheetConfirmService._delete({id: this.elementId, elementId: v}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.loading = false
            })
        },
        resetForm(){
            this.payload.confirmations = []
            this.payload.confirmationObjects = []
            this.payload.mainUser = null
        }
    }
})