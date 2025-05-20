import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import {turnstileWorkDurationService} from "@/service/v1/turnstile/index.js"
import Utils from "@/utils/Utils.js"
import dayjs from "dayjs"

const {t} = i18n.global
export const useTurnstileWorkDurationStore = defineStore('turnstileWorkDurationStore', {
    state: () => ({
        list: [],
        loading: false,
        visible: false,
        visibleType: true,
        elementId: null,
        workerInstance: null,
        instanceLoading: false,
        instanceData: {},
        totalItems: 0,
        allPermissionList: [],
        structureCheck: [],
        workerParams: {
            day: null,
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
    }),
    actions: {
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
            const start =  dayjs(`${this.workerParams.year}-${String(this.workerParams.month).padStart(2, '0')}-01`)
            const end = start.endOf('month')
            const params = {
                // worker_id: this.workerInstance.id,
                worker_id: 190,
                start: start.format('YYYY-MM-DD'),
                end: end.format('YYYY-MM-DD'),
            }
            $ApiService.turnstileWorkDurationService._index({params}).then((res) => {
                res.data.data.data.map(v=>{
                    const key = dayjs(v.event_time).format('DDMMYYYY')
                    if(!this.instanceData[key]){
                        this.instanceData[key] = {}
                    }
                    this.instanceData[key].hours = Math.round(v.total_minutes/60)
                    console.log(this.instanceData)
                    if(this.instanceData[key]?.data){
                        this.instanceData[key].data.push(v)
                    }else{
                        this.instanceData[key].data = [v]
                    }
                })
                this.totalItems = res.data.data.total
            }).finally(() => {
                this.instanceLoading = false
            })
        }
    }
})