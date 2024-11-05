import {defineStore} from "pinia";
export const useComponentStore = defineStore('componentStore', {
    state:()=>({
        organizationLevelList:[],
        organizationLevelLoading:true,

        organizationList:[],
        organizationLoading:false,
    }),
    actions:{
        _organizationLevel(){
            this.organizationLevelLoading= true
            $ApiService.organizationService._level().then((res)=>{
                this.organizationLevelList = res.data.data
            }).finally(()=>{
                this.organizationLevelLoading= false
            })
        },
        _organizations(){
            this.organizationLoading= true
            $ApiService.organizationService._index({
                page:1,
                size:1000
            }).then((res)=>{
                this.organizationList = res.data.data.data
            }).finally(()=>{
                this.organizationLoading= false
            })
        },

    }

})