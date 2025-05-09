
import {defineStore} from "pinia"
import router from "@/router/index.js"
import {AppPaths, useAppSetting} from "@/utils/index.js"
import {useAccountStore} from "@/store/modules/index.js"
import {getActivePinia} from "pinia"
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
            const accountStore = useAccountStore()
            this.loading = true
            let data = {
                phone:this.phone.slice(4).replace('(','').replace(')',''),
                password:this.password,
            }
            $ApiService.authService._login({data}).then((res)=>{
                getActivePinia().reset()
                localStorage.setItem(useAppSetting.tokenKey,res.data.access_token)
                accountStore._index(()=>{
                    router.push(AppPaths.Home)
                })

            }).finally(()=>{
                this.loading = false
            })
        }
    }
})