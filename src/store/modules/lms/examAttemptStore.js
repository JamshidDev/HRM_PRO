import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useExamAttemptStore = defineStore('examAttemptStore', {
    state:()=>({
        questions:[],
        exam_token: null,
        exam_detail: null,
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        continueVisible: false,
        notPermittedVisible: false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        payload:{
            name:null,
        },
    }),
    actions:{
        _config_localstorage(){
            let data = localStorage.getItem('exam_data')
            data = data && JSON.parse(data)
            console.log(data)
            this.exam_token = data && data[this.elementId]
            console.log(this.exam_token)
        },
        _start_attempt(){
            this.loading= true
            $ApiService.workerExamService._start_exam({id: this.elementId}).then((res)=>{
                const {active_token, questions, worker_exam_details} = res.data.data
                this.questions = questions
                this.exam_detail = worker_exam_details
                this.exam_token =  active_token
                let data = localStorage.getItem('exam_data')
                data = data ? JSON.parse(data) : {}
                localStorage.setItem('exam_data', JSON.stringify({...data, [this.elementId]: active_token}))
            }).catch((res)=>{
                if(this.exam_token){
                    this.continueVisible = true    
                }else{
                    this.notPermittedVisible = true
                }                
            }).finally(()=>{
                this.loading = false
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