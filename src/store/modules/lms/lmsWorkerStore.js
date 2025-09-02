import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useLmsWorkerStore = defineStore('lmsWorkerStore', {
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
            worker_position_ids:[],
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
            per_page:200,
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
        _workers(){
            this.workerLoading= true
            this.workerParams.edu_plan_id = this.payload.edu_plan_id
            $ApiService.lmsWorkerService._workers({params:this.workerParams}).then((res)=>{
                const selectedData = this.workerList.filter(v=>this.payload.worker_position_ids.includes(v.id))
                const data = res.data.data.data.map(v=>({
                    ...v,
                    name:Utils.combineFullName(v.worker),
                    position:v?.position,
                }))
                this.workerList=Array.from(new Map([...data, ...selectedData].map(v => [v.id, v])).values())
                this.totalWorker = res.data.data.total
            }).finally(()=>{
                this.workerLoading= false
            })
        },
        _index(){
            this.loading= true
            $ApiService.lmsWorkerService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(data){
            this.saveLoading = true
            $ApiService.lmsWorkerService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.loading = true
            $ApiService.lmsWorkerService._delete({data:{ids:this.selectedWorkers}}).then(()=>{
                this._index()
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