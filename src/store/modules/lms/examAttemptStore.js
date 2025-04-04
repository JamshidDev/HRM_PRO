import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import router from "@/router/index.js";

const {t} = i18n.global
export const useExamAttemptStore = defineStore('examAttemptStore', {
    state: () => ({
        questions:[],
        exam_token: null,
        exam_storage: {},
        worker_detail: null,
        exam_detail:  null,
        loading: false,
        elementId: null,
        questionId: null,
        allPermissionList: [],
        sendResultLoading: false,
        payload: {
            result: null,
        },
        finishLoading: false,
        result: null
    }),
    actions: {
        _config_localstorage() {
            let data = localStorage.getItem('exam_data')
            data = data && JSON.parse(data)
            this.exam_storage = data || {}
            this.exam_token = data && data[this.elementId]
        },
        _start_attempt() {
            this.loading = true
            $ApiService.workerExamService._start_exam({id: this.elementId}).then((res) => {
                const {active_token, questions, worker_exam_details, exam} = res.data.data
                this.exam_detail = exam
                this.questions = questions
                this.worker_detail = worker_exam_details
                this.exam_token = active_token
                let data = localStorage.getItem('exam_data')
                data = data ? JSON.parse(data) : {}
                localStorage.setItem('exam_data', JSON.stringify({...data, [worker_exam_details.id]: active_token}))
                router.push({
                    name: 'solve_exam',
                    params: {
                        exam_id: worker_exam_details.id
                    }
                })

            }).catch((res) => {

            }).finally(() => {
                this.loading = false
            })
        },
        _continue_attempt() {
            if(!this.exam_token) return
            this.loading = true
            $ApiService.workerExamService._continue_exam({id: this.elementId, token: this.exam_token}).then((res) => {
                const {exam, questions, worker_exam_details} = res.data.data
                this.questions = questions
                this.exam_detail = exam
                this.worker_detail = worker_exam_details
            }).catch((res) => {

            }).finally(() => {
                this.loading = false
            })
        },
        _finish_attempt() {
            this.finishLoading = true
            $ApiService.workerExamService._finish_exam({id: this.elementId, token: this.exam_token}).then((res) => {
                let data = localStorage.getItem('exam_data')
                data = data ? JSON.parse(data) : {}
                delete data?.[this.elementId]
                localStorage.setItem('exam_data', JSON.stringify({...data}))
                this.result = res.data.data

            }).catch((res) => {

            }).finally(() => {
                this.finishLoading = false
            })
        },
        _send_result(){
            this.sendResultLoading = true
            $ApiService.workerExamService._send_result({id: this.elementId, token: this.exam_token, data: this.payload, questionId: this.questionId}).then((res) => {
                for(let i of this.questions){
                    if(i.id===this.questionId){
                        i.result = this.payload.result
                        break
                    }
                }
            }).catch((res) => {
                console.log(res)
            }).finally(() => {
                this.sendResultLoading = false
            })
        },
        _get_attempt(){
            this.loading = true
            $ApiService.workerExamService._get_attempt({id: this.elementId}).then((res) => {
                this.questions = res.data.data

            }).catch((res) => {
                console.log(res)
            }).finally(() => {
                this.loading = false
            })
        },
        openVisible(data) {
            this.visible = data
        },
        resetForm() {
            this.payload.name = null
        }
    }
})