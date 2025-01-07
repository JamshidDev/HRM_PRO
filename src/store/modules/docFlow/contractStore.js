import {defineStore} from "pinia";
import Utils from "@/utils/Utils.js"
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
        payload:{
            pin:null,
            organization_id:[],
            contract_date:null,
            number:null,
            table_number:null,
            type:null,
            document_example_id:null,
            director_id:[],
            department_id:[],
            department_position_id:null,
            position_status:null,
            salary:null,
            position_id:null,
            group:null,
            rank:null,
            post_name:null,
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
        _create(){
            this.saveLoading = true
            let data = {
                ...this.payload,
               ...{
                   contract_date:Utils.timeToZone(this.payload.contract_date),
                   organization_id:this.payload.organization_id[0].id,
                   worker_id:this.payload.pin,
                   director_id:this.payload.director_id[0],
               }
            }
            $ApiService.contractService._create({data}).then((res)=>{
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
            $ApiService.nationalityService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.pin = null
            this.payload.organization_id = []
            this.payload.contract_date = null
            this.payload.number = null
            this.payload.table_number = null
            this.payload.type = null
            this.payload.document_example_id = null
            this.payload.director_id = []
            this.payload.department_id = []
            this.payload.department_position_id = null
            this.payload.position_status = null
            this.payload.salary = null
            this.payload.position_id = null
            this.payload.group = null
            this.payload.rank = null
            this.payload.post_name = null
        }

    }

})