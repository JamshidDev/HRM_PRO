
import {defineStore} from "pinia"
import router from "@/router/index.js"

export const useLoginStore = defineStore("loginStore", {
    state:()=>({
        phone:null,
        password:null,
        loading:false,
    }),
    getters:{

    },
    actions:{
        _auth(){
            this.loading = true
            let data = {
                phone:this.phone.slice(4).replace('(','').replace(')',''),
                password:this.password,
            }
            $ApiService.authService._login({data}).then((res)=>{
                localStorage.setItem('token',res.data.access_token)
                router.push('/admin')
            }).catch((err)=>{
                console.log(err)
            }).finally(()=>{
                this.loading = false
            })
        }
    }
})