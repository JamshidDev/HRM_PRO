
import {defineStore} from "pinia"
import router from "@/router"

export const useLoginStore = defineStore("loginStore", {
    state:()=>({
        login:null,
        password:null,
        loading:false,
    }),
    getters:{

    },
    actions:{

        _auth(){
            this.loading = true
            $ApiService.authService._login({data:{
                    username:this.login,
                    password:this.password,
                }}).then((res)=>{
                localStorage.setItem('token',res.data.access)
                localStorage.setItem('refresh_token',res.data.refresh)
                router.push('/admin')

            }).catch((err)=>{
                console.log(err)
            }).finally(()=>{
                this.loading = false
            })
        }




    }
})