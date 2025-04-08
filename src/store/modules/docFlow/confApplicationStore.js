import {defineStore} from "pinia";
import Utils from "@/utils/Utils.js"
import {AppPaths} from "@/utils/index.js"
export const useConfApplicationStore = defineStore('confApplicationStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        stepStatus:'process',
        stepNumber:1,
        department_id:[],
        departmentCheck:[],
        organization_id:[],
        structureCheck:[],
        myPositionList:[],
        positionLoading:false,
        confirmationList:[],
        confirmLoading:false,
        vacationShow:false,

        vacationList:[],
        vacationLoading:false,

        vacationWorkerList:[],
        vacationWorkerLoading:false,
        editLoading:false,
        typeList:[1,2,6,7],
        payload:{
            director_id:null,
            worker_position_id:null,
            type:null,
            confirmations:[],
            period_from:null,
            period_to:null,
            from:null,
            to:null,
            reason:null,
            from_date:null,
            department_position_id:null,
            temporarily_absent:null,
            from_time:null,
            to_time:null,
            contract_to_date:null,
            education_type:null,
            univer_date:null,
            univer_number:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        confirmParams:{
            director_id:null,
            organization_id:null,
            search:null,
        },
        tabList:[
            {
                id:101,
                name:""
            },
            {
                id:100,
                name:"applicationFinish"
            },
            {
                id:3,
                name:"applicationForm3"
            },
            {
                id:4,
                name:"applicationForm4"
            },
            {
                id:1,
                name:"applicationForm1"
            },
            {
                id:2,
                name:"applicationForm2"
            },
            {
                id:5,
                name:"applicationForm5"
            },
            {
                id:6,
                name:"applicationForm6"
            },
            {
                id:7,
                name:"applicationForm7"
            },
            {
                id:9,
                name:"applicationForm9"
            },
            {
                id:10,
                name:"applicationForm10"
            },
            {
                id:8,
                name:"applicationForm8"
            },
        ],
        activeTab:101,

        statisticData:[],
        statisticLoading:false,

    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.applicationService._confIndex({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _statistic(){
            this.statisticLoading= true
            $ApiService.applicationService._statistic().then((res)=>{
                this.statisticData = res.data
            }).finally(()=>{
                this.statisticLoading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                ...this.payload,
                period_from:Utils.timeToZone(this.payload.period_from),
                period_to:Utils.timeToZone(this.payload.period_to),
                from:Utils.timeToZone(this.payload.from),
                to:Utils.timeToZone(this.payload.to),
                from_date:Utils.timeToZone(this.payload.from_date),
                from_time:Utils.timeOnlyHour(this.payload.from_time),
                to_time:Utils.timeOnlyHour(this.payload.to_time),
                contract_to_date:Utils.timeToZone(this.payload.contract_to_date),
                univer_date:Utils.timeToZone(this.payload.univer_date),
                organization_id:this.organization_id,
                department_id:this.department_id,
            }
            $ApiService.applicationService._workerApplication({data}).then((res)=>{
                this.activeTab = 100
                this.stepNumber = 3
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _myPositions(){
            this.positionLoading= true
            $ApiService.applicationService._myPositions( ).then((res)=>{
                this.myPositionList = res.data.data
                if(res.data.data.length === 1){
                    this.payload.worker_position_id = res.data.data[0].id
                }
            }).finally(()=>{
                this.positionLoading= false
            })
        },
        _confirmation(){
            this.confirmLoading = true
            const params = this.confirmParams
            $ApiService.applicationService._confirmation({params}).then((res)=>{
                this.confirmationList = res.data.data.data.map((v)=>({
                    ...v,
                    fullName:Utils.combineFullName(v.worker),
                    position:v?.post_short_name,

                }))
            }).finally(()=>{
                this.confirmLoading= false
            })
        },
        _vacationWorker(id){
            this.vacationWorkerLoading = true
            $ApiService.applicationService._vacationWorker({params:{organizations:id}}).then((res)=>{
                this.vacationWorkerList = res.data.data.data
            }).finally(()=>{
                this.vacationWorkerLoading= false
            })
        },
        _onActiveVacation(id){
                this.vacationLoading = true
            $ApiService.applicationService._workerVacation({data:{worker_positions:[id]}}).then((res)=>{
                this.vacationList = res.data.data
            }).finally(()=>{
                this.vacationLoading= false
            })
        },
        _getEdit(callBack){
            const id = this.elementId
                this.editLoading = true
            $ApiService.applicationService._details({id}).then((res)=>{
                callBack(res.data.data)
            }).finally(()=>{
                this.editLoading = false
            })
        },
        _update(){
            this.saveLoading = true
            let data = {
                ...this.payload,
                period_from:Utils.timeToZone(this.payload.period_from),
                period_to:Utils.timeToZone(this.payload.period_to),
                from:Utils.timeToZone(this.payload.from),
                to:Utils.timeToZone(this.payload.to),
                from_date:Utils.timeToZone(this.payload.from_date),
                from_time:Utils.timeOnlyHour(this.payload.from_time),
                to_time:Utils.timeOnlyHour(this.payload.to_time),
                contract_to_date:Utils.timeToZone(this.payload.contract_to_date),
                univer_date:Utils.timeToZone(this.payload.univer_date),
                organization_id:this.organization_id,
                department_id:this.department_id,
            }
            $ApiService.applicationService._updateWorkerApplication({data, id:this.elementId}).then((res)=>{
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
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.director_id = null
            this.payload.type = null
            this.payload.confirmations = []
            this.payload.worker_position_id = null


            this.payload.period_from = null
            this.payload.period_to = null
            this.payload.from = null
            this.payload.to = null
            this.payload.reason = null
            this.payload.from_date = null
            this.payload.department_position_id = null
            this.payload.temporarily_absent = null

            this.activeTab = 101
            this.stepNumber = 1
            this.department_id = []
            this.departmentCheck = []
            this.organization_id = []
            this.structureCheck = []
        }

    }

})