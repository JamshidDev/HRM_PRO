import {defineStore} from "pinia"

export const useServiceStore = defineStore('servcieStore',{
    state:()=>({
        stepStatus:'process',
        currentStep:1,
        market:{
            name:null,
            description:null,
            bot_token:null,
            image:null,
        },
        activeTab:1,
        tabList:[1,2,3,4]
    }),
    getters:{

    },
    actions:{
        nextTab(){
           this.activeTab++
        },
        previousTab(){
            this.activeTab--
        }

    }
})