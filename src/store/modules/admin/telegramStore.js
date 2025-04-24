import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
export const useTelegramStore = defineStore('telegramStore', {
    state:()=>({
        list:[],
        loading:false,
        deleteLoading: false,
        elementId:null,
        totalItems:0,
        params:{
            page:1,
            per_page:10,
            search:null,
        },
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.telegramService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.telegramService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
    }

})