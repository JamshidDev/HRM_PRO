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
        contractNumber:null,
        payload:{
            command_status:true,
            contract_id:null,
            command_date:null,
            command_number:null,
            type:null,
            confirmations:[],
            director_id:null,
            model:Utils.documentModels.command,
            workers:[],
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
            $ApiService.commandService._index({params:this.params}).then((res)=>{
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
                    command_date:Utils.timeToZone(this.payload.command_date),
                    director_id:this.payload.director_id,
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
        openVisible(data){
            this.visible = data
        },
        resetForm(){
                this.payload.command_status = false
                this.payload.contract_id = null
                this.payload.command_date = null
                this.payload.comtypemand_number = null
                this.payload.confirmations = []
                this.payload.director_id = null
                this.payload.model = Utils.documentModels.command
                this.payload.workers = []

        }

    }

})