import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import topicExamService from "@/service/v1/lms/topicExamService.js";
import Utils from "@/utils/Utils.js";
const {t} = i18n.global
export const useTopicExamStore = defineStore('topicExamStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        attachQuestionVisible: false,
        visibleType:true,
        elementId:null,
        topicId: null,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        questionPayload: {
            questions: []
        },
        payload:{
            name: null,
            whom: null,
            deadline: null,
            minute: null,
            variant: null,
            active: false,
            whom_ids: []
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
            $ApiService.topicExamService._index({params:this.params, id: this.topicId}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            $ApiService.topicExamService._create({
                data: {...this.payload, deadline: Utils.timeToZone(this.payload.deadline)},
                id: this.topicId}
            ).then((res)=>{
                this.visible = false
                this._index()
                this.resetForm()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _update(){
            this.saveLoading = true
            $ApiService.topicExamService._update({
                data:  {...this.payload, deadline: Utils.timeToZone(this.payload.deadline)},
                id:this.topicId, exam_id: this.elementId
            }).then((res)=>{
                this.visible = false
                this._index()
                this.resetForm()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.topicExamService._delete({id:this.topicId, exam_id: this.elementId}).then((res)=>{
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        _show(){
            this.loading = true
            $ApiService.topicExamService._show({id: this.topicId, exam_id:this.elementId}).then((res)=>{
                const data = res.data.data
                this.payload = {
                    ...data,
                    active: !!data.active,
                    whom_ids: data?.positions?.map(i=>i.id) || data?.workers?.map(i=>i.id) || [],
                    whom: data.whom.id,
                    deadline: new Date(data.deadline).getTime()
                }
            }).finally(()=>{
                this.loading = false
            })
        },
        _attach_question(){
            this.saveLoading = true
            $ApiService.topicExamService._attach_question({
                    data: this.questionPayload,
                    id: this.topicId,
                    exam_id: this.elementId
                }
            ).then((res)=>{
                this.attachQuestionVisible = false
                this._index()
                this.resetForm()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
                this.questionPayload.questions = []
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.name = null,
            this.payload.whom = null,
            this.payload.deadline = null,
            this.payload.minute = null,
            this.payload.variant = null,
            this.payload.active = false,
            this.payload.whom_ids = []
        }
    }
})