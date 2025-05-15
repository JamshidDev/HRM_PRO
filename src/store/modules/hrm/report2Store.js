import { defineStore } from "pinia";
import i18n from "@/i18n/index.js"

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
    }),
    actions:{
        _getDepartment(){
            this.departmentLoading = true
            let params = {
                ...this.positionParams,
                organization_id:this.params.organization_id?.[0]?.id
            }
            $ApiService.reportService._department({params}).then((res)=>{
                this.departmentList = res.data.data
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
            this.params.organization_id = v
            this._getDepartment()
        }
    }

})