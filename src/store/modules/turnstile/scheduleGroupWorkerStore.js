import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global

export const useScheduleGroupWorkerStore = defineStore('scheduleGroupWorkerStore', {
    state: () => ({
        list: [],
        loading: false,
        visible: false,

        elementId: null,
        totalItems: 0,

        params: {
            page: 1,
            per_page: 10,
            search: null,
            group:null,
            year1:null,
            month1:null,
            year2:null,
            month2:null,
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
        selectedWorker:null,
        replaceVisible:false,
        replacePayload:{
            positonId:null,
            date:null,
            status:false,
        },
        replaceLoading:false,

        workerList:[],
        totalWorker:0,
        workerLoading:false,



    }),
    getters:{
        calculateWorkTime:(state)=>(workerIndex)=>{
            state.scheduleList
            return 0
        }
    },
    actions: {
        _replaceWorker(data){
            this.replaceLoading = true
            $ApiService.shiftTypeService._replaceWorker({data}).then((res)=>{
                this.replaceVisible = false
                this._dayOfMonth(()=>{
                    this._index()
                })
            }).finally(()=>{
                this.replaceLoading = false
            })
        },
        _workers(){
            const params = {
                start_date:this.params.year1+'-'+this.params.month1.toString().padStart(2,"0")+'-01',
                end_date:this.params.year2+'-'+this.params.month2.toString().padStart(2,"0")+'-01',
                per_page:1000,
            }
            this.workerLoading = true
            $ApiService.shiftTypeService._getWorkers({params}).then((res)=>{
                this.workerList = res.data.data.data.map(v=>({
                    name:Utils.combineFullName(v.worker),
                    id:v.worker.id,
                    positionId:v.id,
                    position:v.position,
                    group:v.scheduleGroup,
                    type:v.scheduleType,
                }))
                this.totalWorker = res.data.data.total
            }).finally(()=>{
                this.workerLoading = false
            })
        },
        _index(){
            const params = {
                year:this.params.year1,
                month:Number(this.params.month1),
                group:this.params.group,
            }
            this.loading = true
            $ApiService.shiftTypeService._groupWorker({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading = false
            })
        },
        _dayOfMonth(callback){
            this.dayOfMonthLoading = true
            const params = {
                year:this.params.year1,
                month:Number(this.params.month1),
            }
            $ApiService.workerScheduleService._daysOfMonth({params}).then((res) => {
                this.dayOfMonth = res.data.data.days
                callback?.()
            }).finally(() => {
                this.dayOfMonthLoading = false
            })
        },

    }
})