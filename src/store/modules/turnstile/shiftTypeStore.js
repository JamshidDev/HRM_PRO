import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global

export const useShiftTypeStore = defineStore('shiftTypeStore', {
    state: () => ({
        list: [],
        loading: false,
        saveLoading: false,
        deleteLoading: false,
        visible: false,
        scheduleVisible: false,
        visibleType: false,
        elementId: null,
        totalItems: 0,

        params: {
            page: 1,
            per_page: 10,
            search: null,
        },
        payload:{
            name:null,
            type:null,
            days:[],
        },
        generatePayload:{
            year1:null,
            year2:null,
            month1:null,
            month2:null,
            name:null,
            start_date:null,
            end_date:null,
        },
        scheduleParams:{
            year:null,
            month:null,
        },
        uiParams:{
            year:null,
            month:null,
        },
        scheduleList:[],
        dayOfMonth:[],
        dayOfMonthLoading:false,
        shortNameOfWeek:{
            1:t('shortWeek.Mon'),
            2:t('shortWeek.Tue'),
            3:t('shortWeek.Wed'),
            4:t('shortWeek.Thu'),
            5:t('shortWeek.Fri'),
            6:t('shortWeek.Sat'),
            0:t('shortWeek.Sun'),
        },
        workers:[],
        workerList:[],
        workerParams:{
            page:1,
            per_page:1000,
            search:null,
        },
        totalWorkerCount:0,

        activeTab:1,

        groupList:[],
        groupParams:{
            page:1,
            per_page:10,
            search:null,
            schedule_type:null,
        },
        groupLoading:false,
        totalGroup:0,

        groupWorkerLoading:false,
        groupWorkerList:[],
        totalGroupWorkerCount:0,
        groupWorkerParams:{
            page:1,
            per_page:10,
            search:null,
            group:null,
        },
        selectedDate:null,

        notScheduleParams:{
            page:1,
            per_page:100,
            search:null,
            start_date:null,
            end_date:null,
            has_schedule:'No'
        },
        notScheduleWorkerList:[],
        notScheduleWorkerCount:0,
        notScheduleVisible:false,
        notScheduleLoading:false,
        isDailySchedule:false,
        selectedWorkers:[],

    }),
    getters:{
        calculateWorkTime:(state)=>(workerIndex)=>{
            state.scheduleList
            return 0
        }
    },
    actions: {
        _notScheduleWorker(){
            const params = {
                ...this.notScheduleParams,
                start_date:Utils.timeToZone(this.notScheduleParams.start_date),
                end_date:Utils.timeToZone(this.notScheduleParams.end_date),
            }
            this.notScheduleLoading = true
            $ApiService.shiftTypeService._getWorkers({params}).then((res)=>{
                this.notScheduleWorkerList = res.data.data.data.map(v=>({
                    name:Utils.combineFullName(v.worker),
                    id:v.id,
                    position:v.position,
                    data:{
                        firstName:v.worker.first_name,
                        lastName:v.worker.last_name,
                        middleName:v.worker.middle_name,
                        photo:v.worker.photo,
                        position:v.position,
                    }
                }))
                this.notScheduleWorkerCount = res.data.data.total
            }).finally(()=>{
                this.notScheduleLoading = false
            })
        },
        _groupWorkers(){
            const params = {
                ...this.groupWorkerParams,
            }
            this.groupWorkerLoading = true
            $ApiService.shiftTypeService._groupWorker({params}).then((res)=>{
                this.groupWorkerList = res.data.data.data
                this.totalGroupWorkerCount = res.data.data.total
            }).finally(()=>{
                this.groupWorkerLoading = false
            })
        },
        _group(){
            const params = {
                ...this.groupParams,
            }
            this.groupLoading = true
            $ApiService.shiftTypeService._group({params}).then((res)=>{
                this.groupList = res.data.data.data
                this.totalGroup = res.data.data.total
            }).finally(()=>{
                this.groupLoading = false
            })
        },
        _getWorkers(){
            const params = {
                ...this.workerParams,
            }
            $ApiService.shiftTypeService._getWorkers({params}).then((res)=>{
                this.workerList = res.data.data.data.map(v=>({
                    name:Utils.combineFullName(v.worker),
                    id:v.id,
                    position:v.position,
                }))
                this.totalWorkerCount = res.data.data.total
            })
        },
        _dayOfMonth(callback){
            this.dayOfMonthLoading = true
            const params = {
                ...this.scheduleParams
            }
            $ApiService.workerScheduleService._daysOfMonth({params}).then((res) => {
                this.dayOfMonth = res.data.data.days
                this.uiParams.year = this.scheduleParams.year
                this.uiParams.month = this.scheduleParams.month
                callback?.()
            }).finally(() => {
                this.dayOfMonthLoading = false
            })
        },
        _index() {
            this.loading = true
            const params = {
                ...this.params,
            }
            $ApiService.shiftTypeService._index({params}).then((res) => {
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(() => {
                this.loading = false
            })
        },
        _create() {
            this.saveLoading = true
            let data = {
                ...this.payload,
            }
            $ApiService.shiftTypeService._generateSchedule({data}).then((res) => {
                this.visible = false
                this._index()

            }).finally(() => {
                this.saveLoading = false
            })
        },
        _generateSchedule(data){
            this._getWorkers()
            this.saveLoading = true
            $ApiService.shiftTypeService._generateSchedule({data}).then((res) => {
                this.scheduleList = res.data.data.work_days
                this.workers = res.data.data.work_days.map(x=>({id:null}))
                this.scheduleParams.year = this.generatePayload.year1
                this.scheduleParams.month = this.generatePayload.month1
                this.selectedDate = this.generatePayload.year1+'-'+this.generatePayload.month1
                this._dayOfMonth()
                this.visible = false
                this.scheduleVisible = true
            }).finally(() => {
                this.saveLoading = false
            })
        },
        _generateWorkerSchedule(data){
            this.saveLoading = true
            // const data = {
            //     start_date:`${this.generatePayload.year1}-${this.generatePayload.month1.toString().padStart(2, '0')}-01`,
            //     end_date:`${this.generatePayload.year2}-${this.generatePayload.month2.toString().padStart(2, '0')}-01`,
            //     schedule_type:this.elementId,
            //     schedule_workers:this.workers.map((v, index)=>({
            //         worker_position_id:v.id,
            //         day:index+1,
            //     }))
            // }
            $ApiService.shiftTypeService._generateWorkerSchedule({data}).then((res)=>{
                this.scheduleVisible = false
                this.notScheduleVisible = false
                store._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },

        _resetGenerateModal(){
            const currentYear =  new Date().getFullYear()
            const currentMonth =  new Date().getMonth()
            this.generatePayload.year1 = currentYear
            this.generatePayload.year2 = currentYear+1
            this.generatePayload.month1 = currentMonth+1
            this.generatePayload.month2 = currentMonth+1
        },
        _deleteGroup(){
            this.groupLoading = true
            $ApiService.shiftTypeService._groupDelete({id:this.elementId}).then((res) => {
                this._group()
            }).finally(() => {
                this.groupLoading = true
            })
        },
        _editGroup(data){
            this.saveLoading = true
            $ApiService.shiftTypeService._groupEdit({id:this.elementId, data}).then((res) => {
                this.visible = false
                this._group()
            }).finally(() => {
                this.saveLoading = false
            })
        },
    }
})