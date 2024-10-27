import {defineStore} from "pinia";
import router from "@/router"
export const useAppStore = defineStore('appStore', {
    state:()=>({
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
        }

    }

})