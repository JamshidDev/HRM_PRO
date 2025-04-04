import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useWorkerExamStore = defineStore('workerExamStore', {
    state:()=>({
        list:[],
        selectedLesson: null,
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        payload:{
            name:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.workerExamService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },

        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.name = null
        }
    }
})