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
        showLoading:false,
        visible:false,
        attachCategoryVisible: false,
        attachCategoryVisibleType: true,
        categoryLoading: false,
        visibleType:true,
        elementId:null,
        topicId: null,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        categoryPayload: {
            category_ids: [],
            categories: []
        },
        questionPayload: {
            question_ids: [],
            questions: []
        },
        payload:{
            name: null,
            whom: null,
            deadline: null,
            active: false,
            minute: 45,
            variant: 3,
            tests_count: 36,
            chances: 3,
            description: null,
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

            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _update(){
            this.saveLoading = true
            $ApiService.topicExamService._update({
                data:  {...this.payload, deadline: this.payload?.deadline && Utils.timeToZone(this.payload.deadline)},
                id:this.topicId, exam_id: this.elementId
            }).then((res)=>{
                this.visible = false
                this._index()
                this.resetForm()

            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.topicExamService._delete({id:this.topicId, exam_id: this.elementId}).then((res)=>{
                this._index()

            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        _show(){
            this.showLoading = true
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
                this.showLoading = false
            })
        },
        _attach_category(){
            this.saveLoading = true
            $ApiService.topicExamService._attach_category({
                    data: {
                        questions: [...this.categoryPayload.categories]
                    },
                    id: this.topicId,
                    exam_id: this.elementId
                }
            ).then((res)=>{
                this.attachCategoryVisible = false
            }).finally(()=>{
                this.saveLoading = false
                this.resetCategoryPayload()
            })
        },
        _get_attached_categories(){
            this.categoryLoading = true
            $ApiService.topicExamService._get_attached_category({
                id: this.topicId,
                exam_id: this.elementId
            }).then((res)=>{
                this.categoryPayload.category_ids = res.data.data.map(i=>i.category.id)
                this.categoryPayload.categories = res.data.data.map(i=>({
                    count: i.count,
                    exam_category_id: i.category.id
                }))
            }).finally(()=>{
                this.categoryLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.name = null
            this.payload.whom = null
            this.payload.deadline = null
            this.payload.minute = 45
            this.payload.variant = 3
            this.payload.active = false
            this.payload.whom_ids = []
            this.payload.chances = 3
            this.payload.tests_count = 36
        },
        resetCategoryPayload(){
            this.categoryPayload.category_ids = []
            this.categoryPayload.categories = []
        }
    },
})