import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useLmsGroupStore = defineStore('lmsGroupStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        showLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        structureCheck2:[],
        payload:{
            edu_plan_id:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            edu_plan_id:null,
            organizations:[],
        },
        workerList:[],
        workerLoading:false,
        totalWorker:0,
        workerParams:{
            page:1,
            per_page:100,
            search:'',
            edu_plan_id:null,
        },

        eduPlanList:[],
        eduPlanLoading:false,
        selectedWorkers:[],
    }),
    actions:{
        _eduPlans(){
            this.eduPlanLoading= true
            $ApiService.lmsWorkerService._eduPlans({params:{page:1, per_page:1000}}).then((res)=>{
                this.eduPlanList = res.data.data.data.map(v=>({
                    ...v,
                    name:v.name,
                    position:v?.specialization?.name + `\n (${v.count_workers})`,
                }))
            }).finally(()=>{
                this.eduPlanLoading= false
            })
        },
        _workers(id){
            this.workerLoading= true
            $ApiService.lmsGroupService._groupWorkers({params:{page:1, per_page:500,group_id:id }}).then((res)=>{
                this.workerList=res.data?.data?.data
                this.totalWorker=res.data?.data?.total
            }).finally(()=>{
                this.workerLoading= false
            })
        },
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.lmsGroupService._index({params}).then((res)=>{
                this.list = res.data.data
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(data, callback){
            this.saveLoading = true
            $ApiService.lmsGroupService._create({data}).then((res)=>{
                callback?.()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.lmsGroupService._delete({data:{worker_position_ids:this.selectedWorkers,group_id:this.elementId}}).then(()=>{
                this._workers(this.elementId)
            }).finally(()=>{
                this.deleteLoading = false
            })
        },

        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.edu_plan_id = null
            this.payload.type = null
            this.payload.worker_position_ids = []

        }
    }
})