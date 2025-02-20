import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useExamAttemptStore = defineStore('examAttemptStore', {
    state:()=>({
        questions:[],
        exam_data: null,
        exam_detail: null,
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
    }),
    actions:{
        _check_attempt(){
            let data = localStorage.getItem('exam_data')
            this.exam_data = data && JSON.parse(data)
            this.visible = !!data

        },
        _start_attempt(){
            this.loading= true
            $ApiService.workerExamService._start_exam({id: this.elementId}).then((res)=>{
                const {active_token, questions, worker_exam_details} = res.data.data
                this.questions = questions
                this.exam_detail = worker_exam_details
                this.exam_data = {token: active_token, id: this.elementId}
                localStorage.setItem('exam_data', JSON.stringify(this.exam_data))
            }).catch((res)=>{
                // let data = localStorage.getItem('exam_data')
                // this.exam_data = data && JSON.parse(data)
                // this.visible = true
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