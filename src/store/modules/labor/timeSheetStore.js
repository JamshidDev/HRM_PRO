import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import dayjs from "dayjs";
const {t} = i18n.global
export const useTimeSheetStore = defineStore('timeSheetStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        visibleLoading:false,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        detail: null,
        payload:{
            department_id: null,
            timestamp: null
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.timeSheetService._index({params:this.params}).then((res)=>{
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
            $ApiService.timeSheetService._create({data}).then((res)=>{
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
            $ApiService.timeSheetService._update({data, id: this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                this.resetForm()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
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
        resetForm(){
            this.payload.timestamp = null
            this.payload.department_id = null
        }
    }
})