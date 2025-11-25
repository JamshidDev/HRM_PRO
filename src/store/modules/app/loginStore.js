
import {defineStore} from "pinia"
import router from "@/router/index.js"
import {AppPaths, useAppSetting} from "@/utils/index.js"
import {useAccountStore, useSocketStore} from "@/store/modules/index.js"
import {getActivePinia} from "pinia"
import {useAnalytics} from "@/utils/index.js"

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
                const socketStore = useSocketStore()
                const token = res.data.access_token
                socketStore.disconnect()
                getActivePinia().reset()
                localStorage.setItem(useAppSetting.tokenKey,token)
                accountStore._index((data)=>{
                    socketStore.initSocket(token, data?.id)
                    localStorage.setItem(useAppSetting.accountUserId, data.id)
                    const parameters = {
                        role:data.role.name,
                        orgName:data.organization?.name,
                        phone:data.phone,
                    }
                    const analytics = useAnalytics(parameters )
                    analytics.trackUserLogin()
                    router.push(AppPaths.Home)
                })

            }).finally(()=>{
                this.loading = false
            })
        }
    }
})