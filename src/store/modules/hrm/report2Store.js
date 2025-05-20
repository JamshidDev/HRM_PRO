import { defineStore } from "pinia";
import i18n from "@/i18n/index.js"
import {useComponentStore} from "@/store/modules/index.js"

const {t} = i18n.global
export const useReport2Store = defineStore('report2Store', {
    state:()=>({
        list:[],
        loading:false,
        orgCheck:[],
        params:{
            organization_id:[],
        },
        departmentList:[],
        department:[],
        departmentLoading:false,
        depCheck:[],
        selectedDepId:null,
        selectedPosId:null,

        positionLoading:false,
        totalPosition:0,
        positionList:[],
        positionParams:{
            page:1,
            per_page:1000,
            search:null,
            organization_id:null,
            department_id:null,
        },
        byPosition:true,

        workerParams:{
            page:1,
            per_page:1000,
            search:null,
            organization_id:null,
            department_id:null,
            department_position_id:null,
        },
        workerLoading:false,
        workerList:[],
        totalWorker:0,
        optimizationLoading:false,

        visible:false,
        showLoading:false,
        saveLoading:false,
        elementId:null,
        lastDepartmentId:null,
        positionPayload:{
            position_id:null,
            department_id:null,
            group:null,
            rank:null,
            max_rank:null,
            rate:null,
            salary:null,
            experience:null,
            education:null,
            organizations:[],
            departments:[],
        },

        confirmVisible:false,
    }),
    actions:{
        _getOptimization(){
            this.optimizationLoading = true
            const department_id = this.selectedDepId
            $ApiService.reportService._optimization({params:{department_id}}).then((res)=>{
                this.confirmVisible = false
                this.getPosition()
            }).finally(()=>{
                this.optimizationLoading = false
            })
        },
        _getDepartment(){
            this.departmentLoading = true
            let params = {
                ...this.positionParams,
                organization_id:this.params.organization_id?.[0]?.id
            }
            $ApiService.reportService._department({params}).then((res)=>{
                this.departmentList = res.data.data.map((v)=>({...v,name:v?.name, position:v?.organization?.name}))
            }).finally(()=>{
                this.departmentLoading = false
            })

        },
        getPosition(){
            this.positionLoading = true
            let params = {
                ...this.positionParams,
                organization_id:this.params.organization_id?.[0]?.id,
                department_id:this.selectedDepId
            }
            $ApiService.reportService._position({params}).then((res)=>{
                this.positionList = res.data.data.data
                this.totalPosition = res.data.data.total
            }).finally(()=>{
                this.positionLoading = false
            })
        },
        getWorker(){
            this.workerLoading = true
            let params = {
                ...this.workerParams,
                organization_id:this.params.organization_id?.[0]?.id,
                department_id:this.selectedDepId,
                department_position_id:this.byPosition? this.selectedPosId : undefined,
            }
            $ApiService.reportService._worker({params}).then((res)=>{
                this.workerList = res.data.data.data
                this.totalWorker = res.data.data.total
            }).finally(()=>{
                this.workerLoading = false
            })
        },
        onChangeDepartment(v){

        },
        async onChangeRadio(v){
            this.selectedDepId =(this.selectedDepId === v.id? null : v.id)
            await nextTick()
            if(this.selectedDepId){
                this.positionList = []
                this.workerList = []
                if(this.byPosition){
                    this.getPosition()
                }else{
                    this.getWorker()
                }


            }
        },
        async onChangePosRadio(v){
            this.selectedPosId =(this.selectedPosId === v.id? null : v.id)
            await nextTick()
            this.workerList = []
            if(this.selectedPosId){
                this.getWorker()
            }
        },
        onChangeFilter(){
            this.selectedDepId = null
            this.byPosition = !this.byPosition
        },
        onChangeOrg(v){
            const store = useComponentStore()
            store.depParams.organizations = [v?.[0]?.id]
            this.params.organization_id = v
            this._getDepartment()
        },
        onEdit(v){
            const store = useComponentStore()
            store._departments()
            this.visible = true
            this.showLoading = true
            this.elementId = v.id
            $ApiService.reportService._showPosition({id:v.id}).then((res)=>{
                const v = res.data.data
                this.positionPayload.position_id = v.position.id
                this.positionPayload.department_id = v.department.id
                this.lastDepartmentId = v.department.id
                this.positionPayload.rate = v.rate?.toString()
                this.positionPayload.rank = v.rank.id
                this.positionPayload.max_rank = v.max_rank.id
                this.positionPayload.group = v.group.id
                this.positionPayload.education = v.education.id
                this.positionPayload.salary = v.salary?.toString()
                this.positionPayload.experience = v.experience?.toString()
            }).finally(()=>{
                this.showLoading = false
            })

        },
        onUpdatePosition(){
            this.saveLoading = true
            let data = {...this.positionPayload}
            $ApiService.departmentPositionService._update({data, id:this.elementId}).then((res)=>{
                this.getPosition()
                if(this.lastDepartmentId !== this.positionPayload.department_id){
                    this._getDepartment()
                }
            }).finally(()=>{
                this.saveLoading = false
                this.visible = false
            })
        }
    }

})