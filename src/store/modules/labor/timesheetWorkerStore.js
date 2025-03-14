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
                    total: i.days.reduce((acc, cur) => acc+cur?.hours || 0, 0)
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
        _index_workers(){
            this.loading = true
            let params = {
                ...this.params
            }
            $ApiService.timeSheetWorkerService._index({id: this.elementId, params}).then((res)=>{
                this.list = res.data.data.data.map(i=>({
                    ...i,
                    total: i.days.reduce((acc, cur) => acc+cur?.hours || 0, 0)
                }))
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading = false
            })
        },
        _create(){
            if (!this.payload.start || !this.payload.end) return;
            let rowStart = Math.min(this.payload.start.row, this.payload.end.row);
            let rowEnd = Math.max(this.payload.start.row, this.payload.end.row);
            let colStart = Math.min(this.payload.start.col, this.payload.end.col);
            let colEnd = Math.max(this.payload.start.col, this.payload.end.col);
            this.saveLoading = true
            let data = {
                status: this.payload.status,
                hours: this.payload.hours || 0,
                workers: (()=>{
                    let arr = []
                    while(rowStart<=rowEnd){
                        let start = colStart
                        let end = colEnd
                        while(start<=end){
                            arr.push({
                                id: this.list[rowStart].id,
                                day: dayjs().year(this.year).month(this.month).date(start+1).format("YYYY-MM-DD")
                            })
                            start++
                        }
                        rowStart++
                    }
                    return arr
                })()
            }
            $ApiService.timeSheetWorkerService._create({data, id: this.elementId}).then((res)=>{
                this._index_workers()
                this.resetSelection()
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
        resetAll(){
            this.payload.status = null
            this.payload.hours = null
            this.payload.start = null
            this.payload.end = null
            this.payload.isClearing = false
        }
    }
})