import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useSliceStore = defineStore('sliceStore', {
    state:()=>({
        cols:[
            {
                name:'Korxonalar',
                id:1,
            },
            {
                name:'Bolimlar',
                id:2,
            },
            {
                name:'Lavozimlar',
                id:3,
            },
            {
                name:'Xodimlar',
                id:4,
            },
        ],
        barList:[],
        hiddenList:[],
        fullScreen:false,

        organizations:[],
        checkV:[],

    }),
    getters:{
       showPanel:(state)=>(id)=>{
            return !state.barList.map(v=>v.id).includes(id)
       },
    },
    actions:{
        closePanel(id){
           const index = this.cols.findIndex(v=>v.id === id)
            if(index !== -1){
                this.barList.push(this.cols[index])
            }
        },
        addPanel(item){
            const index = this.barList.findIndex(v=>v.id === item.id)
            if(index !== -1){
                this.barList.splice(index,1)
            }

        },
        changeScreenMode(){
            this.fullScreen = !this.fullScreen
        }
    }

})