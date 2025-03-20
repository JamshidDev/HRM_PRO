import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import dayjs from "dayjs";
const {t} = i18n.global
export const useTimesheetWorkerStore = defineStore('timesheetWorkerStore', {
    state:()=>({
        list:[],
        days: [],
        totalItems:0,
        loading:false,
        saveLoading:false,
        visible:false,
        elementId:null,
        allPermissionList:[],
        structureCheck:[],
        department: null,
        month: null,
        year: null,
        payload:{
            status: null,
            hours: null,
            status2: null,
            hours2: null,
            start: null,
            end: null,
            isClearing: false
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
    }),
    actions:{
        _index(){
            this.loading = true
            let promises = []
            let params = {
                ...this.params
            }
            promises.push($ApiService.timeSheetWorkerService._index({id: this.elementId, params}).then((res)=>{

                this.list = res.data.data.data.map(i=>({
                    ...i,
                    days: Object.fromEntries(i.days.map(i=>[i.day, i.details])),
                    halfMonth: {
                        days: i.days.filter(i=>i.day<=15).length,
                        hours: i.days.filter(i=>i.day<=15).reduce((sum, day) => {
                            const dayHours = day.details.reduce((daySum, detail) => {
                                return daySum + detail.hours
                            }, 0);
                            return sum + dayHours
                        }, 0)
                    },
                    allMonth: {
                        days: i.days.length,
                        hours: i.days.reduce((sum, day) => {
                            const dayHours = day.details.reduce((daySum, detail) => {
                                return daySum + detail.hours
                            }, 0)

                            return sum + dayHours;
                        }, 0)
                    }
                }))
                this.totalItems = res.data.data.total
            }))
            promises.push($ApiService.timeSheetWorkerService._get_days({id: this.elementId}).then((res)=>{
                this.days = res.data.data.days
                this.month = res.data.data.month-1
                this.year = res.data.data.year
                this.department = res.data.data.department
            }))
            Promise.all(promises).then(()=>{
                this.loading = false
            })
        },
        _create(){
            if (!this.payload.start || !this.payload.end) return;
            this.saveLoading = true
            let rowStart = Math.min(this.payload.start.row, this.payload.end.row);
            let rowEnd = Math.max(this.payload.start.row, this.payload.end.row);
            let colStart = Math.min(this.payload.start.col, this.payload.end.col);
            let colEnd = Math.max(this.payload.start.col, this.payload.end.col);

            let workers = []
            while(rowStart<=rowEnd){
                let start = colStart
                let end = colEnd
                while(start<=end){
                    workers.push({
                        id: this.list[rowStart].id,
                        day: dayjs().year(this.year).month(this.month).date(start+1).format("YYYY-MM-DD")
                    })
                    start++
                }
                rowStart++
            }

            let data = {
                status: this.payload.status,
                hours: this.payload.hours || 0,
                workers
            }
            let promises = []
            promises.push($ApiService.timeSheetWorkerService._create({data, id: this.elementId}))
            if(this.payload.status2){
                let data2 = {
                    status: this.payload.status2,
                    hours: this.payload.hours2 || 0,
                    workers
                }
                promises.push($ApiService.timeSheetWorkerService._create({data: data2, id: this.elementId}))
            }
            Promise.all(promises).then(()=>{
                this._index()
                this.resetAll()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        // _update(){
        //     this.saveLoading = true
        //     const date = dayjs(this.payload.timestamp)
        //     let data = {
        //         ...this.payload,
        //         month: date.month()+1,
        //         year: date.year(),
        //     }
        //     $ApiService.timeSheetService._update({data, id: this.elementId}).then((res)=>{
        //         this.visible = false
        //         this._index()
        //         this.resetForm()
        //     }).finally(()=>{
        //         this.saveLoading = false
        //     })
        // },
        // _show(){
        //     this.visibleLoading = true
        //     $ApiService.userDepartmentService._show({id:this.elementId}).then((res)=>{
        //
        //         this.payload.worker_positions = res.data.data.users.map(i=>i.id)
        //         this.visible = true
        //     }).finally(()=>{
        //         this.visibleLoading = false
        //     })
        // },

        openVisible(data){
            this.visible = data
        },
        resetSelection(){
            this.payload.start = null
            this.payload.end = null
        },
        resetStatuses(){
            this.payload.status = null
            this.payload.hours = null
            this.payload.status2 = null
            this.payload.hours2 = null
        },
        resetAll(){
            this.payload.status = null
            this.payload.hours = null
            this.payload.status2 = null
            this.payload.hours2 = null
            this.payload.start = null
            this.payload.end = null
            this.payload.isClearing = false
        }
    }
})