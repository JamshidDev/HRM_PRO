import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import dayjs from "dayjs";
const {t} = i18n.global
export const useTimesheetDepartmentStore = defineStore('timesheetDepartmentStore', {
    state:()=>({
        list:[],
        days: [],
        totalItems:0,
        loading:false,
        saveLoading:false,
        visible:false,
        elementId:null,
        deleteLoading: false,
        tabs: [
            {
            type: 'organization',
            label: t('timesheet.type.organization')
            },
            {
            type: 'department',
            label: t('timesheet.type.department')
        }],
        allPermissionList:[],
        structureCheck:[],
        departmentCheck:[],
        department: null,
        month: null,
        year: null,
        payload:{
            type: 'organization',
            organizations: [],
            departments: [],
            worker_position_id: null
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
        },
        listVisible:false,
        previewList:[],

        departmentParams:{
            page:1,
            per_page:1000,
            search:null,
        },
        departmentList:[],
        departmentLoading:false,
    }),
    actions:{
        _department(){
            this.departmentLoading = true
            let params = {
                ...this.departmentParams,
                organizations:this.payload.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.componentService._departmentByOrganizations({params}).then((res)=>{
                const selectedData =this.departmentList.filter(v=>this.payload.departments.includes(v.id))

                const data = res.data.data.data.map(v=>({
                    id:v.id,
                    name:v.name,
                    position:v.organization?.name,
                }))

                this.departmentList = [...new Map([...data, ...selectedData].map(v=>[v.id, v])).values()]
            }).finally(()=>{
                this.departmentLoading = false
            })
        },
        _index(){
            this.loading = true
            let params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.timesheetDepartmentService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading = false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                worker_position_id:this.payload.worker_position_id,
                organization_id: this.payload.organizations.map(i=>i.id),
                departments: this.payload.departments,
            }
            $ApiService.timesheetDepartmentService._create({data}).then((res)=>{
                this.visible = false
                this.resetForm()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(data, callback=null){
            this.deleteLoading = true
            $ApiService.timesheetDepartmentService._delete({data}).then((res)=>{
                this._index()
                callback?.()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        resetDefaults(){
            this.payload.organizations = []
            this.payload.departments = []
        },
        resetForm(){
            this.payload.organizations = []
            this.payload.departments = []
            this.payload.type =  'organization'
            this.payload.worker_position_id = null
        },
    }
})