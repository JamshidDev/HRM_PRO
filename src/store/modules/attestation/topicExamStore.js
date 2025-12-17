import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import topicExamService from "@/service/v1/attestation/topicExamService.js";
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
        payload:{
            name: null,
            whom: null,
            deadline: null,
            active: false,
            minute: 45,
            variant: 4,
            tests_count: 36,
            chances: 3,
            description: null,
            whom_ids: [],
            camera:false,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        positionList:[],
        positionLoading:false,

        workerParams:{
            page:1,
            per_page:200,
            search:null,
        },
        workerLoading:false,
        totalWorker:0,
        workerList:[],
        checkedWorkers:[],
        checkWorkerLoading:false,
        workerPin:null

    }),
    actions:{
        onOpenWorkerEv(v){
            if(!v) return
            this.workerParams.search=null
            this.workerParams.page=1
            this._workers()
        },
        _checkWorker(pin){
            this.checkWorkerLoading = true
            $ApiService.workerService._checkWorker({params:{pin}}).then((res)=>{
                if(!res.data.error){
                    this.checkedWorkers = this.checkedWorkers.filter(v=>this.payload.whom_ids.includes(v.id))
                    let data = res.data.data
                    this.checkedWorkers.unshift({
                        id:data.id.toString(),
                        name:Utils.combineFullName(data),
                        position:`${t('workerPage.checkWorker.born')} ${Utils.timeOnlyDate(data?.birthday)}`,

                    })
                }else{
                    $Toast.info(t('content.notWorker'))
                }

            }).finally(()=>{
                this.checkWorkerLoading = false
            })
        },
        _workers(infinity=false){
            this.workerLoading = true
            let params ={
                ...this.workerParams,
            }
            $ApiService.topicExamService._worker({params, id: this.topicId}).then((res)=>{
                let data = res.data.data.data.map((v)=>({
                    ...v,
                    name:v.worker.last_name + ' '+v.worker.first_name+' '+v.worker.middle_name,
                    position:v.position?.name,
                    id:v.id,
                    photo: v.worker?.photo
                }))
                this.totalWorker =res.data.data.total
                const options = infinity ? [...data, ...this.workerList] : data
                this.workerList =Array.from(new Map([...options].map(v => [v.id, v])).values())

            }).finally(()=>{
                this.workerLoading = false
            })
        },
        onSearchWorker(){
            this.workerParams.page = 1
            this._workers()

        },
        onScrollWorker(e){
            const currentTarget = e.currentTarget;
            if(currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight && !this.workerLoading && this.totalWorker>this.workerList.length){
                this.workerParams.page +=1
                this._workers(true)
            }
        },
        _position(){
            this.positionLoading= true
            $ApiService.topicExamService._position({params:{page:1, per_page:1000}, id: this.topicId}).then((res)=>{
                this.positionList = res.data.data.map(v=>({
                    ...v,
                    position:v.id
                }))
            }).finally(()=>{
                this.positionLoading= false
            })
        },
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
                data: {
                    ...this.payload,
                    deadline: Utils.timeToZone(this.payload.deadline),
                    description:this.payload.description || undefined,
                },
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
                data:  {
                    ...this.payload,
                    deadline: this.payload?.deadline && Utils.timeToZone(this.payload.deadline),
                },
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
                this.workerPin = null
                this.payload = {
                    ...data,
                    active: !!data.active,
                    whom_ids: data?.positions?.map(i=>i.id) || data?.workers?.map(i=>i.id) || [],
                    whom: data.whom.id,
                    deadline: new Date(data.deadline).getTime(),
                    camera:Boolean(data.camera),
                }
                if(res.data.data.whom.id === 2){
                    this._position()
                }else if(res.data.data.whom.id === 3){
                    this.workerList = res.data.data.workers.map(v=>({
                        ...v,
                        name:Utils.combineFullName(v.worker),
                        position:v.post_name,
                        id:v.id,
                    }))
                    this._workers()
                }else if(res.data.data.whom.id === 5){
                    this.checkedWorkers = res.data.data.workers.map(v=>({
                        name:Utils.combineFullName(v),
                        position:`${t('workerPage.checkWorker.born')} ${Utils.timeOnlyDate(v?.birthday)}`,
                        id:v.id
                    }))

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
            this.payload.variant = 4
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