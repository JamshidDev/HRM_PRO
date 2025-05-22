import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useVacationScheduleStore = defineStore('vacationScheduleStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allRegionList:[],
        allLoading:false,
        structureCheck:[],
        payload:{
            worker_position_id:null,
            organization_id:[],
            month:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
        },

        othersList:[],
        otherLoading:false,
        otherVisible:false,
        otherParam:{
            page:1,
            per_page:30,
            search:null,
            organizations:[],
        },
        otherTotal:0,
        structureCheck2:[],

    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.vacationScheduleService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _otherWorkers(){
            const params = {
                ...this.otherParam
            }
            this.otherLoading= true
            $ApiService.vacationScheduleService._notIncludes({params}).then((res)=>{
                this.othersList = res.data.data.data.map((v)=>({...v,month:null}))
                this.otherTotal = res.data.data.total
            }).finally(()=>{
                this.otherLoading= false
            })
        },
        _create(callback=null){
            this.saveLoading = true
            const data = {
                ...this.payload,
                organization_id:this.payload.organization_id?.[0]?.id,
                month:this.payload.month,
            }
            $ApiService.vacationScheduleService._create({data}).then((res)=>{
                this.visible = false
                if(callback) return callback?.()
                this._index()

            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            const data = {
                ...this.payload,
                organization_id:undefined,
                worker_position_id:undefined,
            }
            $ApiService.vacationScheduleService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()

            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.vacationScheduleService._delete({id:this.elementId}).then((res)=>{
                this._index()

            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm() {
            this.elementId = null
            this.payload.worker_position_id = null
            this.payload.month = null
            this.payload.organization_id = []

        }

    }

})