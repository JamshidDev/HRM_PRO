import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'

const { t } = i18n.global
export const useLmsCertificateStore = defineStore('lmsCertificateStore', {
    state: () => ({
        list: [],
        loading: false,
        saveLoading: false,
        visible: false,
        visibleType: true,
        elementId: null,
        totalItems: 0,
        params:{
            page:1,
            per_page:10,
            search:null,
            group_id:null,
            organization_id:[],
            year:null,
            month:null,
            direction_id:null,
            specialization_id:null,
            edu_plan_id:null,
        },

        payload: {
            group_id:null,
            protocol_id:null,
            workers:[],
            protocol_date:null,
            cert_from:null,
            cert_to:null,
        },
        workerLoading: false,
        exam:{
            loading:false,
        },

    }),
    actions: {
        _index(){
            const params = {
                ...this.params,
            }
            this.loading = true
            $ApiService.certificateService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.totalItems
            }).finally(()=>{
                this.loading = false
            })

        },
        _openModal(v){
            this.payload.group_id  = v.id
            this._getWorkers()
            this._getProtocol()
            this.visible = true
        },
        _workerExam(index, status) {
            this.workerLoading = true
            const workerId =this.payload.workers[index].workerId
            $ApiService.certificateService
                ._workerExams({ params: {worker_id:workerId}})
                .then((res) => {
                    this.payload.workers[index][status ? 'startOption' : 'endOption'] = res.data.data.data.map(v =>({
                        id: v.id,
                        name:v.exam?.name,
                        position:v.exam?.topic?.type?.name,
                        subPosition:`${v.result}/${v?.exam?.tests_count}`+ ' ' + Utils.timeHHMMWithMonth(v?.exam?.deadline),
                    }))
                })
                .finally(() => {
                    this.workerLoading= false
                })
        },
        _getProtocol(){
            const groupId = this.payload.group_id
            $ApiService.certificateService
                ._protocol({ params: {group_id:groupId}})
                .then((res) => {
                    this.payload.protocol_id = res.data.data?.id ?? null
                    this.payload.cert_from = Utils.datePickerFormatter(res.data.data?.cert_from)
                    this.payload.cert_to = Utils.datePickerFormatter(res.data.data?.cert_to)
                    this.payload.protocol_date = Utils.datePickerFormatter(res.data.data?.protocol_date)
                })
                .finally(() => {
                    this.workerLoading= false
                })
        },
        _getWorkers(){
            const group_id = this.payload.group_id
            this.workerLoading = true
            $ApiService.lmsGroupService
                ._groupWorkers({ params: {group_id, page:1, per_page:500}})
                .then((res) => {
                    this.payload.workers = res.data.data.data.map((v)=>({
                        id: v.id,
                        workerId: v.worker?.id,
                        workerPositionId: v?.worker_position_id,
                        data:{
                            photo: v?.worker?.photo,
                            lastName: v?.worker?.last_name,
                            firstName: v?.worker?.first_name,
                            middleName: v?.worker?.middle_name,
                            position: v?.position ?? ''
                        },
                        start_exam_result: v?.certificate?.start_exam_result || null,
                        end_exam_result: v?.certificate?.end_exam_result || null,
                        start_exam_id:null,
                        end_exam_id:null,

                        showStartInput:true,
                        showEndInput:true,

                        startOption:[],
                        endOption:[],
                    }))
                })
                .finally(() => {
                    this.workerLoading = false
                })
        },
        _create(data) {
            this.saveLoading = true
            $ApiService.certificateService
                ._create({ data })
                .then((res) => {
                    this.visible = false
                })
                .finally(() => {
                    this.saveLoading = false
                })
        },
        _delete() {
            this.deleteLoading = true
            $ApiService.directionService
                ._delete({ id: this.elementId })
                .then((res) => {
                    this._index()
                })
                .finally(() => {
                    this.deleteLoading = false
                })
        },
    }
})
