import {defineStore} from "pinia";

export const useTopicExamResultStore = defineStore('topicExamResult', {
    state:()=>({
        list:[],
        loading:false,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        params:{
            page:1,
            per_page:10,
            search:null,
        },
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.topicExamResultService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
    }
})