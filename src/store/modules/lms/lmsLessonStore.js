import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useLmsLessonStore = defineStore('lmsLessonStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        showLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        structureCheck2:[],
        payload:{
            name:null,
            name_ru:null,
            name_en:null,
            learning_center_id:null,
            edu_plan_id:null,
            group_id:null,
            lesson_date:null,
            start_time:null,
            end_time:null,
            subject_id:null,
            teacher_id:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            learning_center_id:null,
            start_date:null,
            end_date:null,
            year:null,
            month:null,
        },
        currentTime:null,
        eduPlans:[],
        eduPlanLoading:false,
        groupList:[],
        groupLoading:false,
        teacherLoading:false,
        teacherList:[],
        subjectList:[],
        previewVisible:false,
        selectedLesson:null,
        examPayload:{
            type:null,
            edu_plan_id:null,
            lesson_id:null,
            exam_id:null,
        },
        examLoading:false,
        examList:[],
        resultList:[],
        resultParams:{
            page:1,
            per_page:10,
            search:null,
        },
        totalResult:0,
        resultLoading:false,
    }),
    actions:{
        _resultIndex(){
            this.resultLoading = true
            const params = {
               ...this.resultParams,
            }
            $ApiService.lmsExamService._result({params}).then((res)=>{
                this.resultList = res.data?.data?.data
                this.totalResult = res.data?.data?.total
            }).finally(()=>{
                this.resultLoading = false
            })
        },
        _exams(){
            this.examLoading = true
            $ApiService.lmsExamService._index({page:1, per_page:1000}).then((res)=>{
                this.examList = res.data?.data?.data.map(v=>({
                    id:v.id,
                    name:v.name,
                    position:v.topic?.name,
                }))
            }).finally(()=>{
                this.examLoading = false
            })
        },
        _attachmentExam(callback){
            this.examLoading = true
            const data = {
                ...this.examPayload,
            }
            $ApiService.lmsExamService._create({data}).then((res)=>{
                callback?.()
            }).finally(()=>{
                this.examLoading = false
            })
        },
        _eduPlans(){
            this.eduPlanLoading = true
            const learning_center_id = this.payload.learning_center_id
            $ApiService.eduPlanService._index({params:{page:1, per_page:1000, learning_center_id}}).then((res)=>{
                this.eduPlans = res.data.data.data
            }).finally(()=>{
                this.eduPlanLoading = false
            })
        },
        _groups(){
            this.groupLoading = true
            const edu_plan_id = this.payload.edu_plan_id
            $ApiService.lmsGroupService._index({params:{page:1, per_page:1000, edu_plan_id}}).then((res)=>{
                this.groupList = res.data.data.map(v=>({
                    id:v.id,
                    name:v.code,
                    position:v.workers,
                }))
            }).finally(()=>{
                this.groupLoading = false
            })
        },
        _teacher(){
            this.teacherLoading = true
            const learning_center_id = this.payload.learning_center_id
            $ApiService.teacherService._index({params:{page:1, per_page:1000, learning_center_id}}).then((res)=>{
                this.teacherList = res.data.data.data.map(v=>({
                    ...v,
                    id:v.id,
                    name:Utils.combineFullName(v.worker),
                    position:' ',
                }))
            }).finally(()=>{
                this.teacherLoading = false
            })
        },
        _index(){
            this.loading= true
            const rangeMonth = Utils.getMonthRange(this.params.year, this.params.month)
            const params = {
                ...this.params,
                ...rangeMonth,
                year:undefined,
                month:undefined,

            }
            $ApiService.lmsLessonService._index({params}).then((res)=>{
                this.list = res.data.data
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(data){
            this.saveLoading = true
            $ApiService.lmsLessonService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.lmsLessonService._delete({id:this.elementId}).then(()=>{
               this.previewVisible = false
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.name = null
            this.payload.name_ru = null
            this.payload.name_en = null
            this.payload.learning_center_id = null
            this.payload.edu_plan_id = null
            this.payload.group_id = null
            this.payload.lesson_date = null
            this.payload.start_time = '09:00'
            this.payload.end_time = '11:00'
            this.payload.subject_id = null
            this.payload.teacher_id = null


        }
    }
})