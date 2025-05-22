import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import dayjs from "dayjs";
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useTimesheetStore = defineStore('timesheetStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        closeLoading: false,
        visible:false,
        visibleType:true,
        elementId:null,
        visibleLoading:false,
        warningVisible: false,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        detail: null,
        payload:{
            department_id: undefined,
            work_place_id: undefined,
            timestamp: null,
            active_tab: 'organization'
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
        },
        structureCheck2:[],
    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.timesheetService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            const date = dayjs(this.payload.timestamp)
            let data = {
                ...this.payload,
                month: date.month()+1,
                year: date.year(),
            }
            $ApiService.timesheetService._create({data}).then((res)=>{
                this.visible = false
                this._index()
                this.resetForm()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _update(){
            this.saveLoading = true
            const date = dayjs(this.payload.timestamp)
            let data = {
                ...this.payload,
                month: date.month()+1,
                year: date.year(),
            }
            $ApiService.timesheetService._update({data, id: this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                this.resetForm()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _closeTimesheet(){
            this.saveLoading = true
            $ApiService.timesheetService._accept({data: {active: false}, id: this.elementId}).then((res)=>{
                this.warningVisible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.timestamp = null
            this.payload.department_id = undefined
            this.payload.work_place_id = undefined
        }
    }
})