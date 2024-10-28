import {defineStore} from "pinia";
import router from "@/router"
export const useAccountStore = defineStore('accountStore', {
    state:()=>({
        account:null,
        activeTab:1,
        tabs:[1,2,3,4]
    }),
    actions:{
        _account(){
            $ApiService.accountService._getAccount({data:this.payload}).then((res)=>{
                console.log(res.data)
            })
        }
    }

})