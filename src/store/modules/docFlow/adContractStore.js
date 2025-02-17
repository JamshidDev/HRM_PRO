import {defineStore} from "pinia";
import Utils from "@/utils/Utils.js"
import {useComponentStore} from "@/store/modules/index.js"

export const useAdContractStore = defineStore('adContractStore', {
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
            worker_position_id:null,
            contract_date:null,
            number:null,
            command_status:false,
            command_type:null,
            type:null,
            director_id:null,
            organization_id:[],
            department_id:[],
            department_position_id:null,
            position_status:false,
            salary:null,
            position_id:null,
            group:null,
            rank:null,
            post_name:null,
            schedule_id:null,

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
            $ApiService.adContractService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(callBack){
            const compStore = useComponentStore()
            this.saveLoading = true
            let data = {
                ...this.payload,
                ...{
                    command_date:Utils.timeToZone(this.payload.command_date),
                    contract_date:Utils.timeToZone(this.payload.contract_date),
                    organization_id:this.payload.organization_id.length>0? this.payload.organization_id[0].id : null,
                    worker_position_id: this.payload.worker_position_id,
                    director_id:this.payload.director_id,
                    department_id:this.payload.department_id.length>0? this.payload.department_id[0].id : null,
                }
            }
            $ApiService.adContractService._create({data}).then((res)=>{
                this.visible = false
                if(callBack === null){
                    this._index()
                }
                callBack?.()

            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            $ApiService.adContractService._update({data:this.payload, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.adContractService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        _finishContract(id){
            this.loading = true
            const data = {
                model:Utils.documentModels.adContract,
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
            $ApiService.adContractService._create({data:formData}).then((res)=>{
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
            this.payload.worker_position_id = null
            this.payload.contract_date = new Date().getTime()
            this.payload.number = null
            this.payload.type = null
            this.payload.command_status = false
            this.payload.command_type = null
            this.payload.director_id = null
            this.payload.organization_id = []
            this.payload.department_id = []
            this.payload.department_position_id = null
            this.payload.position_status = false
            this.payload.salary = null
            this.payload.position_id = null
            this.payload.group = null
            this.payload.rank = null
            this.payload.post_name = null
            this.payload.schedule_id = null

            this.payload.command_date = null
            this.payload.command_number = null
            this.payload.confirmations = []
        }

    }

})