
import {defineStore} from "pinia"
import router from "@/router"

export const useLoginStore = defineStore("loginStore", {
    state:()=>({
        phone:'+998',
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
                console.log(res.data)
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