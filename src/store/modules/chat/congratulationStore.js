import { defineStore } from 'pinia'
import {Utils} from "@utils"

export const useCongratulationStore = defineStore('congratulationStore', {
    state: () => ({
        list: [],
        loading: false,
        totalItems: 0,
        visible:false,
        params: {
            page: 1,
            per_page: 10,
            search: null,
            date:null,
            type:null,
        },
        dashboard:{
            loading:false,
            cards:[],
        },
        selectedContent:null,
    }),
    actions: {
        _dashboard(){
            this.dashboard.loading = true
            $ApiService.congratulationService._dashboard().then((res) => {
                this.dashboard.cards = res.data.data.by_types
            }).finally(()=>{
                this.dashboard.loading = false
            })
        },
       _index(){
           this.loading = true
           const params = {
               ...this.params,
               date: Utils.timeToZone(this.params.date),
           }
           $ApiService.congratulationService._index({params}).then((res) => {
               this.list = res.data.data.data
               this.totalItems = res.data.data.total
           }).finally(()=>{
               this.loading = false
           })
       }
    }
})
