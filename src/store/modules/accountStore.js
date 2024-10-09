import {defineStore} from "pinia";
import router from "@/router"
export const useAccountStore = defineStore('accountStore', {
    state:()=>({
        account:null,
    }),
    actions:{
        _account(){
            $ApiService.accountService._getAccount({data:this.payload}).then((res)=>{
                console.log(res.data)
            })
        }
    }

})