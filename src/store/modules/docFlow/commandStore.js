import {defineStore} from "pinia";
import Utils from "@/utils/Utils.js"
export const useCommandStore = defineStore('commandStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        structureCheck:[],

        payload:{
            workers:[],
            organization_id:[],
            command_date:null,
            command_number:null,
            command_type:null,
            confirmations:[],
            director_id:null,
        },
        vacation:{
            from:null,
            main_day:null,
            second_day:null,
            additional:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        vacations:[],
        calculateLoading:false,
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.commandService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(form){
            this.saveLoading = true
            let data = {
                ...this.payload,
                ...{
                    command_date:Utils.timeToZone(this.payload.command_date),
                    director_id:this.payload.director_id,
                    worker_positions:form,
                }
            }
            $ApiService.commandService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            $ApiService.nationalityService._update({data:this.payload, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.commandService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        _calculateVacation(data, idx){
            this.calculateLoading = true
            $ApiService.vacationService._vacationCalculate({data:{worker_positions:[data]}}).then((res)=>{
                const data = res.data.data[0]
                this.vacations[idx].result = {
                    ...data,
                    all_day:data.all_day.toString(),
                    period_from: new Date(data.period_from).getTime(),
                    period_to: new Date(data.period_to).getTime(),
                    to: new Date(data.to).getTime(),
                    work_day: new Date(data.work_day).getTime(),
                }
            }).finally(()=>{
                this.calculateLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
                 this.payload.command_date = null
                 this.payload.command_type = null
                this.payload.command_number = null
                this.payload.confirmations = []
                this.payload.director_id = null
                this.payload.workers = []
                this.payload.organization_id = []

        }

    }

})