
import {defineStore} from "pinia";

export const useRegisterStore = defineStore('registerStore', {
    state:()=>({
        payload:{
            email:null,
            password:null,
            first_name:null,
            last_name:null,
        },
        loading:false,


    }),
    actions:{
        _register(){
            console.log(this.payload)
            $ApiService.authService._register({data:this.payload}).then((res)=>{
                console.log(res.data)
            })
        }
    }

})