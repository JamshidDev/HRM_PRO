import {defineStore} from "pinia";
import router from "@/router/index.js"
import Utils from "@/utils/Utils.js"
import {AppPaths} from "@/utils/index.js"

export const useTopicExamResultStore = defineStore('topicExamResult', {
    state:()=>({
        list:[],
        loading:false,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        structureCheck2:[],
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
            topics:[],
            exams:[],
            deleted_at:false,
        },
        topicList:[],
        topicLoading:false,
        examList:[],
        examLoading:false,
        downloadLoading:false,
    }),
    actions:{
        _downloadNotPassedExam(){
            this.downloadLoading= true
            const params = this._paramToQuery()
            $ApiService.topicExamResultService._downloadNoPassedWorker({params}).then(()=>{
                // router.push(Utils.routeHrmPathMaker(AppPaths.Export))
            }).finally(()=>{
                this.downloadLoading= false
            })
        },
        _downloadExam(){
            this.downloadLoading= true
            const params = this._paramToQuery()
            $ApiService.topicExamResultService._downloadExam({params}).then(()=>{
                // router.push(Utils.routeHrmPathMaker(AppPaths.Export))
            }).finally(()=>{
                this.downloadLoading= false
            })
        },
        _finishExam(){
            this.loading= true
            $ApiService.topicExamResultService._finishedExam().then((res)=>{
                this._index()
            }).finally(()=>{
                this.loading= false
            })
        },
        _delete(){
            this.loading= true
            $ApiService.topicExamResultService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.loading= false
            })
        },
        _exam(topics){
            this.examLoading= true
            $ApiService.topicExamResultService._exams({params:{page:1, per_page:1000, topics}}).then((res)=>{
                this.examList = res.data.data.data.map(v=>({...v, position:`${v.topic?.name}`}))
            }).finally(()=>{
                this.examLoading= false
            })
        },
        _topic(){
            this.topicLoading = true
            $ApiService.topicExamResultService._topics({params:{page:1, per_page:1000}}).then((res)=>{
                this.topicList = res.data.data.data.map(v=>({...v, position:v.type?.name}))
            }).finally(()=>{
                this.topicLoading= false
            })
        },
        _index(){
            this.loading= true
            const params = this._paramToQuery()
            $ApiService.topicExamResultService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _paramToQuery(){
            return  {
                ...this.params,
                organizations:this.params.organizations?.map(v=>v.id).toString() || undefined,
                deleted_at:this.params.deleted_at? undefined : true,
                exams:this.params.exams?.toString() || undefined,
                topics:this.params.topics?.toString() || undefined,
            }
        }

    }
})