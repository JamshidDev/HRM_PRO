import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useIncentiveStore = defineStore('incentiveStore', {
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
    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                created:Utils.timeToZone(this.params.created),
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.incentiveService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
    }

})