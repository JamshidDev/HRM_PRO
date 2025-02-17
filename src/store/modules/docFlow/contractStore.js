import {defineStore} from "pinia";
import Utils from "@/utils/Utils.js"
import {useComponentStore} from "@/store/modules/index.js"

export const useContractStore = defineStore('contractStore', {
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
        departmentCheck:[],
        confirmationVisible:false,
        number:null,
        payload:{
            pin:null,
            organization_id:[],
            contract_date:null,
            number:null,
            table_number:null,
            type:null,
            director_id:null,
            department_id:[],
            department_position_id:null,
            position_status:true,
            salary:null,
            position_id:null,
            group:null,
            rank:null,
            rate:null,
            post_name:null,
            contract_to_date:null,
            probation:null,
            position_date:null,
            vacation_main_day:null,
            additional_vacation_day:null,
            schedule_id:null,
            files:[],
            command_type:null,
            command_status:false,

            command_date:null,
            command_number:null,
            confirmations:[],


        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.contractService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(callback){
            const compStore = useComponentStore()
            this.saveLoading = true
            let data = {
                ...this.payload,
               ...{
                   command_date:Utils.timeToZone(this.payload.command_date),
                   contract_date:Utils.timeToZone(this.payload.contract_date),
                   contract_to_date:Utils.timeToZone(this.payload.contract_to_date),
                   position_date:Utils.timeToZone(this.payload.position_date),
                   organization_id:this.payload.organization_id[0].id,
                   worker_id:compStore.isSelectedWorker? Number(compStore.worker.pin) : this.payload.pin,
                   director_id:this.payload.director_id,
                   department_id:this.payload.department_id.length>0? this.payload.department_id[0].id : null,
               }
            }
            delete data.pin
            $ApiService.contractService._create({data}).then((res)=>{
                if(this.payload.files.length>0){
                    this._attachFile(res.data.data.contract_id, callback)
                }else{
                    this.visible = false
                    if(callback === null){
                        this._index()
                    }

                    callback?.(res.data.data.contract_id)
                }

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
            $ApiService.contractService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        _finishContract(id){
            this.loading = true

            const data = {
                model:Utils.documentModels.contract,
                command_status:false,
                contract_id:id
            }
            $ApiService.commandService._create({data}).then(()=>{
                this._index()
            }).finally(()=>{
                this.loading = false
            })

        },
        _attachFile(id, callback){
            this.saveLoading = true
            const formData = new FormData()
            formData.append('document_id',id)
            formData.append('model','contracts')
            this.payload.files.forEach(v=>{
                formData.append('file',v.file)
            })
            $ApiService.documentFileService._create({data:formData}).then((res)=>{
                this.visible = false
                callback?.()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.pin = null
            this.payload.organization_id = []
            this.payload.contract_date = new Date().getTime()
            this.payload.number = null
            this.payload.table_number = null
            this.payload.type = null
            this.payload.director_id = null
            this.payload.department_id = []
            this.payload.department_position_id = null
            this.payload.position_status = true
            this.payload.salary = null
            this.payload.position_id = null
            this.payload.group = null
            this.payload.rank = null
            this.payload.rate = null
            this.payload.post_name = null
            this.payload.probation = null
            this.payload.position_date = new Date().getTime()
            this.payload.vacation_main_day = '21'
            this.payload.additional_vacation_day = '4'
            this.payload.schedule_id = null
            this.payload.command_type = null
            this.payload.files = []
            this.payload.contract_to_date = null

            this.payload.command_date = null
            this.payload.command_number = null
            this.payload.confirmations = []
        }

    }

})