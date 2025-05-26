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
            worker:null,
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
        form_32:{
            contract_to_date:null,
        },
        form_43:{
            new_date:null,
            work_day:null,
            reason:null,
        },
        form_44:{
            new_date:null,
            rest_day:null,
            reason:null,
        },
        form_45:{
            from:null,
            to:null,
            work_day:null,
        },
        form_48:{
            from:null,
            to:null,
            work_day:null,
            all_day:null,
            reason:null,
        },
        form_49:{
            from:null,
            to:null,
            work_day:null,
        },
        form_51:{
            from:null,
            to:null,
            work_day:null,
            reason:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
            confirmation:null,
            created:null,
        },
        vacations:[],
        vacations55:[],
        vacations62:[],
        workerData:[],
        calculateLoading:false,
        vacationLoading:false,
        vacationId:null,
        structureCheck2:[],
        viewLoading:false,
    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                created:Utils.timeToZone(this.params.created),
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.commandService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(data){
            this.saveLoading = true
            $ApiService.commandService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _viewCommand(data){
            this.viewLoading = true
            $ApiService.commandService._create({data:{...data, status:'view'}}).then((res)=>{
            }).finally(()=>{
                this.viewLoading = false
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
                this.payload.worker = null
                this.payload.organization_id = []
                this.vacations = []

                this.form_32.contract_to_date = null

                this.form_44.new_date = null
                this.form_44.rest_day = null
                this.form_44.reason = null

        },
        lastVacation(callback){
            let data = {
                worker_positions:[this.vacationId],
            }
                this.vacationLoading = true
            $ApiService.vacationService._lastOne({data}).then((res)=>{
                callback?.(res.data.data)
            }).finally(()=>{
                this.vacationLoading = false
            })
        },

    }

})