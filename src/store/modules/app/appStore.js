import {defineStore} from "pinia";
import router from "@/router/index.js"
import {AppPaths, useAppSetting} from "@/utils/index.js"
import {customTheme} from "@/assets/theme/theme.js"
import i18n from "@/i18n/index.js"

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
        ],
        theme:customTheme(),
        themeSwitch:false,
    }),
    actions:{
        _logOutApp(){
            localStorage.removeItem('appSidebar')
            localStorage.removeItem('token')
            router.push(AppPaths.Login)
        },
        changeTheme(){
            const mode = this.themeSwitch? "dark" : "light"
            const html = document.documentElement
            html.setAttribute('data-theme', mode)
            this.theme = customTheme()
            localStorage.setItem(useAppSetting.themeKey, mode)
        },
        initApp(){
            const mode = localStorage.getItem(useAppSetting.themeKey) || useAppSetting.defaultThemeKey
            i18n.global.locale = localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage

            this.themeSwitch = mode === 'dark'
            const html = document.documentElement
            html.setAttribute('data-theme', mode)

            this.theme = customTheme()
        }
    }

})