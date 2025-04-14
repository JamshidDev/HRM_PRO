import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"

const {t} = i18n.global
export const useReportStore = defineStore('reportStore', {
    state:()=>({
        cols:[
            {
                name:'Korxonalar',
                id:1,
            },
            {
                name:'Bolimlar',
                id:2,
            },
            {
                name:'Lavozimlar',
                id:3,
            },
            {
                name:'Xodimlar',
                id:4,
            },
        ],
        barList:[
            {
                name:'Bolimlar',
                id:2,
            },
            {
                name:'Lavozimlar',
                id:3,
            },
            {
            name:'Xodimlar',
            id:4,
        },],
        hiddenList:[],
        fullScreen:false,


        organizationList:[],
        organizations:[],
        orgCheck:[],
        organizationLoading:false,

        departmentList:[],
        departments:[],
        depCheck:[],
        departmentLoading:false,

        positionList:[],
        position:null,
        positionLoading:false,
        positionParams:{
            page:1,
            per_page:10,
            search:null,
            organization_id:null,
            department_id:null,
        },
        totalPosition:0,

        workerList:[],
        workerLoading:false,
        workerParams:{
            page:1,
            per_page:10,
            search:null,
            organization_id:null,
            department_id:null,
            department_position_id:null,
        },
        totalWorker:0,


    }),
    getters:{
       showPanel:(state)=>(id)=>{
            return !state.barList.map(v=>v.id).includes(id)
       },
    },
    actions:{
        closePanel(id){
           const index = this.cols.findIndex(v=>v.id === id)
            if(index !== -1){
                this.barList.push(this.cols[index])
            }
        },
        addPanel(item){
            const index = this.barList.findIndex(v=>v.id === item.id)
            if(index !== -1){
                this.barList.splice(index,1)
            }

        },
        changeScreenMode(){
            this.fullScreen = !this.fullScreen
        },


        getOrganization(){
            this.organizationLoading = true
            $ApiService.reportService._structure().then((res)=>{
                this.organizationList = res.data.data
            }).finally(()=>{
                this.organizationLoading = false
            })
        },
        changeOrg(v){
            this.organizations = v
            this.departmentList = []
            this.getDepartment()

        },

        getDepartment(){
            this.departmentLoading = true
            let params = {
                ...this.positionParams,
                organization_id:this.organizations?.[0].id
            }
            $ApiService.reportService._department({params}).then((res)=>{
                this.departmentList = res.data.data
            }).finally(()=>{
                this.departmentLoading = false
            })
        },
        changeDepartment(v){
            this.departments = v
            this.getPosition()
        },
        getPosition(){
            this.positionLoading = true
            let params = {
                ...this.positionParams,
                department_id:this.departments?.[0]?.id
            }
            $ApiService.reportService._position({params}).then((res)=>{
                this.positionList = res.data.data.data
                this.totalPosition = res.data.data.total
            }).finally(()=>{
                this.positionLoading = false
            })
        },
        changePosition(v){
            this.position =this.position === v? null : v
            this.workerParams.department_position_id = v
            this.getWorker()
        },
        getWorker(){
            this.workerLoading = true
            let params = {
                ...this.workerParams,
            }
            $ApiService.reportService._worker({params}).then((res)=>{
                this.workerList = res.data.data.data
                this.totalWorker = res.data.data.total
            }).finally(()=>{
                this.workerLoading = false
            })
        },
    }

})