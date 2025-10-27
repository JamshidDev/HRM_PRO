import {defineStore} from "pinia";
import Utils from "@/utils/Utils.js"
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
            login_at:null,
            ip_address:null,

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
            let params = {
                page:this.params.page,
                per_page:this.params.per_page,
                search:this.params.search,
                description:this.params.description,
                subject_type:this.params.subject_type,
                created_at:Utils.timeToZone(this.params.created_at),
                organizations:this.params.organizations.map((v)=>v.id).toString() || null,
            }
            $ApiService.logService._actionLog({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _getAuthLog(){
            this.authLoading= true
            let params = {
                page:this.params.page,
                per_page:this.params.per_page,
                search:this.params.search,
                ip_address:this.params.ip_address,
                login_at:Utils.timeToZone(this.params.login_at),
                organizations:this.params.organizations.map((v)=>v.id).toString() || null,
            }
            $ApiService.logService._authLog({params}).then((res)=>{
                this.authList = res.data.data.data
                this.authTotalItems = res.data.data.total
            }).finally(()=>{
                this.authLoading= false
            })
        },
        _filterEvent(){
            this.params.page = 1
            this.params.per_page = 10
            if(this.activeTab === 1){
                this._getActionLog()
            }else{
                this._getAuthLog()
            }
        }

    }

})