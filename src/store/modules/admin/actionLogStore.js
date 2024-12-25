import {defineStore} from "pinia";
export const useActionLogStore = defineStore('actionLog', {
    state:()=>({
        list:[],
        authList:[],
        loading:false,
        authLoading:false,
        activeTab:1,
        activeCol:null,
        authActiveCol:null,
        elementId:null,
        totalItems:0,
        authTotalItems:0,
        organization:null,
        payload:{
            name:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
            created_at:null,
            subject_type:null,
            description:null,
        },
        authParams:{
            page:1,
            per_page:10,
            search:null,
        },
        structureCheck:[],

    }),
    actions:{
        _getActionLog(){
            this.loading= true
            $ApiService.logService._actionLog({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _getAuthLog(){
            this.authLoading= true
            $ApiService.logService._authLog({params:this.authParams}).then((res)=>{
                this.authList = res.data.data.data
                this.authTotalItems = res.data.data.total
            }).finally(()=>{
                this.authLoading= false
            })
        },

    }

})