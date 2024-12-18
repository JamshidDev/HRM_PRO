import {defineStore} from "pinia";
import router from "@/router/index.js"
import {AppPaths} from "@/utils/index.js"
export const useAppStore = defineStore('appStore', {
    state:()=>({
        appConfig:{
            signatureLogin:true,
        },
        mapLocation:{
            center: [69.240562,41.311081],
            zoom: 12,
        },
        mapMarker:[
            {
                coords:[69.240562,41.311081],
                name:"Tashkent"
            }
        ]
    }),
    actions:{
        _logOutApp(){
            localStorage.removeItem('appSidebar')
            localStorage.removeItem('token')
            router.push(AppPaths.Login)
        }

    }

})