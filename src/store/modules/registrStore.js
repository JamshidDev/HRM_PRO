
import {defineStore} from "pinia";
import router from "@/router"
export const useRegisterStore = defineStore('registerStore', {
    state:()=>({
        payload:{
            phone:"+998",
            first_name:null,
            last_name:null,
            middle_name:null,
            pin:null,
        },
        create:{
            phone:null,
            pin:null,
            password:null,
            otp:null,
            user:null,
            photo:null,
        },
        loading:false,
        tabList:[1,2],
        activeTab:2,


    }),
    actions:{
        _register(){
            console.log(this.payload)
            $ApiService.authService._register({data:this.payload}).then((res)=>{
                router.push('/verification-email')
            })
        }
    }

})