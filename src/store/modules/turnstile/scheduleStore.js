import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useScheduleTableStore = defineStore('scheduleStore', {
    state: () => ({
        params:{
            page:1,
            per_page:10,
            type:null,
            year:null,
            month:null,
        },
        scheduleTypes:[],
        scheduleLoading:false,
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
        workerLoading:false,
        workerList:[],
        totalWorkerCount:0,
        workerParams:{
            page:1,
            per_page:100,
            search:null,
        },
        workDays:[],
        generateLoading:false,
        nextTickKey:0,
        workerIndex:null,
        dayIndex:null,
        contextOptions:[],
        defaultOptions:[
            {
            label:t('schedule.form.holiday'),
            workStatus:false,
            key:0,
            icon: () => '🏖️'
        },
            {
                type: 'divider',
                key: 'd1'
            },
            {
                workStatus:false,
                label:t('schedule.form.otherTime'),
                key: 'otherTime',
                icon: () => '✏️'
            }],
        selectedOption:null,
        timePayload:{
            startTime:null,
            endTime:null,
        },
        timeVisible:false,
        selectedCellSet:new Set(),
        savingVisible:false,
        readyToSaveCount:0,
        savingLoading:false,
        savingPercent:0,
        activeSearch:false,
    }),

    getters:{
        calculateWorkTime:(state)=>(workerIndex)=>{
            if(state.workerList[workerIndex].days.length === 0) return 0
            const workTimeMinute = state.workerList[workerIndex].days.reduce((sum, day) => {
                return sum + (day?.workTime || 0)
            }, 0)

            return Math.floor(workTimeMinute/60)
        }
    },

    actions: {
        _searchWorker(){
            this.workerParams.page = 1
            this._allWorkers()
        },
        _updateTurnstile(id, status){
            this.workerLoading = true
            $ApiService.workerScheduleService._updateTurnstile({id, data:{is_turnstile:!status}}).then((res)=>{
                this._allWorkers()
            }).finally(()=>{
                this.workerLoading = false
            })
        },
        _allWorkers(){
            this.workerLoading = true
            const params = {
                ...this.workerParams,
                date:`${this.params.year}-${this.params.month}-01`,
                schedule_type:this.params.type,
            }
            $ApiService.workerScheduleService._index({params}).then((res) => {
                const defaultBox = {
                    isWorkDay:false,
                    startTime:null,
                    endTime:null,
                    workTime:0,
                    empty:true,
                }


                const formatSchedule = (day)=>({
                    isWorkDay:!!day.work_status,
                    startTime:day.start_time?.slice(0, 5) ?? null,
                    endTime:day.end_time?.slice(0,5) ?? null,
                    workTime:day.daily_minutes,
                    empty:day.id === null,
                })

                this.workerList = res.data.data.data.map((v, index)=>({
                    id:v.id,
                    fullName:Utils.combineFullName(v.worker),
                    position:v.position,
                    index:index,
                    workDay:null,
                    type:v?.schedule_type?.type?.name || null,
                    scheduleType:v?.schedule_type?.name || null,
                    canRecognize:v?.is_turnstile,
                    days:!v.schedules?.length?
                        Array.from({length: this.dayOfMonth.length},
                            () => ({...defaultBox})
                        )
                        : v.schedules.map(formatSchedule),
                    isEdit:false,
                    number:(this.workerParams.page - 1) * this.workerParams.per_page + index + 1
                }))
                this.totalWorkerCount = res.data.data.total
            }).finally(() => {
                this.workerLoading = false
            })
        },
        _generateSchedule(day, workerIndex){
            this.generateLoading = true
            const data = {
                start_date:`${this.params.year}-${this.params.month}-01`,
                schedule_type:this.params.type,
                start_day_in_schedule_types:day,
            }

            $ApiService.workerScheduleService._generate({data}).then(async (res)=>{
                const days = res.data.data.work_days
                this.workerList[workerIndex].isEdit = true
                this.workerList[workerIndex].days =days.map(v=>({
                    isWorkDay:v.work_status,
                    startTime:v.start_time || null,
                    endTime:v.end_time || null,
                    workTime:v.daily_minutes,
                }))
                this.nextTickKey++
            }).finally(()=>{
                this.generateLoading = false
            })

        },
        _scheduleType(){
            this.scheduleLoading = true
            const params = {
                ...this.params
            }
            $ApiService.shiftTypeService._index({params}).then((res) => {
                this.scheduleTypes = res.data.data.data
            }).finally(() => {
                this.scheduleLoading = false
            })
        },
        _dayOfMonth(callback){
            this.dayOfMonthLoading = true
            const params = {
                ...this.params
            }
            $ApiService.workerScheduleService._daysOfMonth({params}).then((res) => {
                this.dayOfMonth = res.data.data.days
                callback?.()
            }).finally(() => {
                this.dayOfMonthLoading = false
            })
        },
        _initialData(){
            if(this.scheduleTypes.length>0) return
            this.params.year = new Date().getFullYear()
            this.params.month = new Date().getMonth() + 1
            this._dayOfMonth(()=>{
                this._allWorkers()
            })
            this._scheduleType()
        },
        _calculateMinute(startTime, endTime){
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);
            let start = startHour * 60 + startMinute;
            let end = endHour * 60 + endMinute;
            if (end < start) end += 24 * 60;
            return end - start;
        },
        async _save(){
            this.savingVisible = true
            this.savingPercent = 0
            const workers = this.workerList.filter(v=>v.days.length > 0 && v.isEdit)
            this.readyToSaveCount = workers.length
            if(workers.length === 0){
                this.savingLoading = false
                this.savingVisible = false
            }

            const date = `${this.params.year}-${this.params.month}-01`
            this.savingLoading = true
            for(let i=0;i<workers.length;i++){
                const worker = workers[i]
                const workerPayload = {
                    worker_position_ids:[worker.id],
                    schedule_type:this.params.type,
                    work_days:worker.days.map((v,idx)=>({
                        date:`${this.params.year}-${this.params.month}-${idx+1}`,
                        work_status:v.isWorkDay,
                        start_time:v.startTime,
                        end_time:v.endTime,
                        daily_minutes:v.workTime,
                    }))
                }

                const data = {
                    date,
                    days:[workerPayload]
                }
                try{
                    const res = await $ApiService.workerScheduleService._create({data})
                    this.savingPercent = Math.floor((i+1)/workers.length*100)
                }catch (error){
                    console.log(error)
                }


            }
            this.savingLoading = false
            this.savingVisible = false
        }
    }
})
