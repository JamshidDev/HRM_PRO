import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useHolidayStore = defineStore('holidayStore', {
    state:()=>({
        currentDate:null,
        defaultDate:null,
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        payload:{
            name:null,
            holiday_date:null,
            type:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            month:null,
            year:null,
        },

    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.holidayService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data.map((v)=>({
                    ...v,
                    holiday_date:Utils.timeOnlyDate(v.holiday_date)
                }))
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
               ...this.payload,
                holiday_date:Utils.timeToZone(this.payload.holiday_date)
            }
            $ApiService.holidayService._create({data}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            let data = {
                ...this.payload,
                holiday_date:Utils.timeToZone(this.payload.holiday_date)
            }
            $ApiService.holidayService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.holidayService._delete({id:this.elementId}).then((res)=>{
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(v){
            this.visible = v
        },
        resetForm(){
            this.elementId = null
            this.payload.name = null
            this.payload.holiday_date = null
            this.payload.type = null
        }

    }

})