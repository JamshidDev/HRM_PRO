import {defineStore} from "pinia";
import Utils from "@/utils/Utils.js"
import {AppPaths} from "@/utils/index.js"
import router from "@/router/index.js"
export const usePunishmentStore = defineStore('punishmentStore', {
    state:()=>({
        list:[],
        loading:false,
        totalItems:0,
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
            created:null,
        },
        downloading:false,
    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                created:Utils.timeToZone(this.params.created),
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.punishmentService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _download(){
            this.downloading= true
            const params = {
                ...this.params,
                created:Utils.timeToZone(this.params.created),
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
                download:true
            }
            $ApiService.punishmentService._index({params}).then((res)=>{
                router.push(Utils.routeHrmPathMaker(AppPaths.Export))
            }).finally(()=>{
                this.downloading= false
            })
        }
    }

})