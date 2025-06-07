import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useTicketStore = defineStore('ticketStore', {
    state:()=>({
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
            tickets:[],
            worker_positions:[],
            commission_leader_id:null,
        },
        confirmPayload:{
            med_status:null,
            med_date:null,
            to:null,
            comment:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organization_id:[],
        },
        enableCheck:true,
        selectedWorkers:[],
        commissionList:[],
        commissionLoading:false,

        confirmVisible:false,
        confirmLoading:false,

    }),
    actions:{
        _confirm(){
            const data = {
                ...this.confirmPayload,
                med_date:Utils.timeToZone(this.confirmPayload.med_date),
                to:Utils.timeToZone(this.confirmPayload.to),
            }
            this.confirmLoading= true
            $ApiService.ticketService._confirm({data, id:this.elementId}).then((res)=>{
               this._index()
            }).finally(()=>{
                this.confirmLoading= false
            })
        },
        _index(){
            this.loading= true
            const params = {
                ...this.params,
            }
            $ApiService.ticketService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _commission(id){
            this.commissionList = []
            this.commissionLoading = true
            $ApiService.ticketService._commission({id}).then((res)=>{
                this.commissionList = res.data.data
            }).finally(()=>{
                this.commissionLoading = false
            })
        },
        _checkWorker(id){
            return this.selectedWorkers.map((v)=>v.id).includes(id)
        },
        _selectEv(v){
            const exists  = this.selectedWorkers.some((x)=>x.id === v.id)
            this.selectedWorkers = exists? this.selectedWorkers.filter((x)=>x.id !== v.id) : [...this.selectedWorkers, v]
        },
        _removeEv(v){
            this.selectedWorkers = this.selectedWorkers.filter((x)=>x.id !== v.id)
        },
        _create(){
            this.saveLoading = true
            let data = {
                ...this.payload,
                tickets:this.selectedWorkers.map((v)=>v.id),
            }
            $ApiService.ticketService._create({data}).then((res)=>{
                this.selectedWorkers = []
                this.visible = false
                this._index()

            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            let data = {
                ...this.payload,
                worker_id:this.payload.pin,
                position:this.payload.position,
            }
            $ApiService.confirmationService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()

            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(v){
            if(v.commission_leader_id === null){
                $Toast.warning(t('ticket.form.warning'))
                return
            }

            this.deleteLoading = true
            $ApiService.ticketService._delete({id:this.elementId}).then((res)=>{
                this._index()

            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.elementId = null
            this.payload.tickets = []
            this.payload.worker_positions = []
            this.payload.commission_leader_id = null
        },
        resetConfirmForm(){
            this.elementId = null
            this.confirmPayload.med_status = null
            this.confirmPayload.med_date = new Date().getTime()
            this.confirmPayload.to = null
            this.confirmPayload.comment = null
        }

    }

})