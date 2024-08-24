import {defineStore} from "pinia"

export const useServiceStore = defineStore('servcieStore',{
    state:()=>({
        stepStatus:'process',
        currentStep:1,
    }),
    getters:{

    },
    actions:{

    }
})