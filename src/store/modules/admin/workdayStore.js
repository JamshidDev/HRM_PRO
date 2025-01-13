import {defineStore} from "pinia";
import Utils from "@/utils/Utils.js"
export const useWorkdayStore = defineStore('workdayStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        payload:{
            schedule_id:null,
            day_of_week:null,
            start_time:null,
            end_time:null,
            type:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        }
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.workdayService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            const data = {...this.payload}
            data.start_time = Utils.timeOnlyHour(this.payload.start_time)
            data.end_time = Utils.timeOnlyHour(this.payload.end_time)
            console.log(data)
            $ApiService.workdayService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            const data = {...this.payload}
            data.start_time = Utils.timeOnlyHour(this.payload.start_time)
            data.end_time = Utils.timeOnlyHour(this.payload.end_time)
            $ApiService.workdayService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.workdayService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        resetForm(){
            this.elementId = null
            this.payload.name = null
            this.payload.schedule_id = null
            this.payload.day_of_week = null
            this.payload.start_time = null
            this.payload.end_time = null
            this.payload.type =null
        }

    }

})