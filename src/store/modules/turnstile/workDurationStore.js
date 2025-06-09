import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
import dayjs from "dayjs"

const {t} = i18n.global
export const useTurnstileWorkDurationStore = defineStore('turnstileWorkDurationStore', {
    state: () => ({
        loading: false,
        list: [],
        visible: false,
        visibleType: true,
        elementId: null,
        workerInstance: null,
        instanceLoading: false,
        instanceData: {},
        totalItems: 0,
        allPermissionList: [],
        structureCheck: [],
        dayLogList: [],
        dayLogParams: {
            date: null,
            building: null,
        },
        calendarParams: {
            year: null,
            month: null,
        },
        defaultParams: {
            start: null,
            end: null
        },
        params: {
            page: 1,
            per_page: 10,
            search: null,
            start: null,
            end: null
        },
        tooltipVisible: false,
        lateVisible:false,
        lateLoading:false,
        lateList:[],
        lateParams:{
            page: 1,
            per_page: 10,
            search: null,
            from:null,
            to:null,
            first_time:null,
        },
    }),
    actions: {
        _lateComers(){
            const params = {
                ...this.lateParams,
                from:Utils.timeToZone(this.lateParams.from),
                to:Utils.timeToZone(this.lateParams.to),
            }
            this.lateLoading = true
            $ApiService.turnstileWorkDurationService._latecomers({params}).then((res) => {
                this.lateList = res.data.data?.data || []
                this.totalItems = res.data?.data?.total
            }).finally(() => {
                this.lateLoading = false
            })
        },
        _index() {
            this.loading = true
            const params = {
                ...this.params,
                start: Utils.timeToZone(this.params.start),
                end: Utils.timeToZone(this.params.end),
            }
            $ApiService.turnstileWorkDurationService._index({params}).then((res) => {
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(() => {
                this.loading = false
            })
        },
        _instance(){
            this.instanceLoading = true
            const start =  dayjs(`${this.calendarParams.year}-${String(this.calendarParams.month).padStart(2, '0')}-01`)
            const end = start.endOf('month')
            const params = {
                worker_id: this.workerInstance.worker.id,
                start: start.format('YYYY-MM-DD'),
                end: end.format('YYYY-MM-DD'),
            }

            this.instanceData = {}

            $ApiService.turnstileWorkDurationService._index({params}).then((res) => {
                res.data.data.data.map(v=>{
                    const key = this.dateToKey(v.year, v.month, v.day)
                    if(this.instanceData[key]){
                        this.instanceData[key].data.push(v)
                    }else{
                        this.instanceData[key] = {
                            data: [v],
                            date:this.dateToKey(v.year, v.month, v.day, '-'),
                        }
                    }
                })
            }).finally(() => {
                this.instanceLoading = false
            })
        },
        _logs() {
            this.instanceLoading = true
            const params = {
                date: this.dayLogParams.date,
                building_id: this.dayLogParams.building?.id,
                worker_id: this.workerInstance.worker.id,
            }
            $ApiService.turnstileWorkDurationService._logs({params}).then((res) => {
                this.dayLogList = res.data.data
            }).finally(() => {
                this.instanceLoading = false
            })
        },
        dateToKey(year, month, date, delimeter){
            if(delimeter){
                return dayjs(`${year}.${String(month).padStart(2, '0')}.${String(date).padStart(2, '0')}`).format(`YYYY${delimeter}MM${delimeter}DD`)
            }
            return dayjs(`${year}.${String(month).padStart(2, '0')}.${String(date).padStart(2, '0')}`).format("YYYYMMDD")
        }
    }
})