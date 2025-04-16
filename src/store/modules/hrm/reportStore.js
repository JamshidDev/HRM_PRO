import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"

const {t} = i18n.global
export const useReportStore = defineStore('reportStore', {
    state:()=>({
        cols:[
            {
                name:t('reportPage.tab.organization'),
                id:1,
            },
            {
                name:t('reportPage.tab.department'),
                id:2,
            },
            {
                name:t('reportPage.tab.position'),
                id:3,
            },
            {
                name:t('reportPage.tab.worker'),
                id:4,
            },
        ],
        panels:1,
        activePanels:[],
        barList:[],
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
        activePanelCount:(state)=>{
           return state.activePanels.length;
        },
        isActivePanel:(state)=>(id)=>{
           return state.activePanels.map(v=>v.id).includes(id)
        }

    },
    actions:{
        closePanel(id){
            setTimeout(()=>{
                this.panels--
            },0)
           const index = this.activePanels.findIndex(v=>v.id === id)
            if(index !== -1){

                this.barList.push(this.activePanels[index])
                this.activePanels.splice(index,1)

            }
        },
        addPanel(item){
            this.beforeOpen(item)
            if(this.activePanelCount <3){
                const index = this.barList.findIndex(v=>v.id === item.id)
                if(index !== -1){
                    this.barList.splice(index,1)
                }
                this.activePanels.push(item)
                this.panels++

            }else{
                this.barList[0]=this.activePanels[2]
                this.activePanels[2]=item
            }

        },
        beforeOpen(item){
            if(item.id === 2){
                this.getDepartment()

            }else if(item.id === this.cols[2].id){
                this.resetPosition()
                if(this.departments?.[0]?.id){
                    this.positionParams.department_id = this.departments?.[0]?.id
                }else if(this.organizations?.[0]?.id){
                    this.positionParams.organization_id = this.organizations?.[0]?.id
                }
                this.getPosition()
            }
            else if(item.id === 4){
                this.resetWorker()
                this.getWorker()
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

            this.resetWorker()
            this.resetPosition()
            this.resetDepartment()

            // if(this.activePanelCount === 1 && !this.isActivePanel(this.cols[1].id)){
            //     this.barList.splice(0,1)
            // }


            if(this.isActivePanel(this.cols[1].id)){
                this.getDepartment()
            }else if(this.isActivePanel(this.cols[2].id)){
                this.positionParams.organization_id = this.organizations?.[0]?.id
                this.getPosition()
            }
            else if(this.isActivePanel(this.cols[3].id)){
                this.workerParams.organization_id = this.organizations?.[0]?.id
                this.getWorker()
            }
        },

        getDepartment(){
            this.departmentLoading = true
            let params = {
                ...this.positionParams,
                organization_id:this.organizations?.[0]?.id
            }
            $ApiService.reportService._department({params}).then((res)=>{
                this.departmentList = res.data.data
            }).finally(()=>{
                this.departmentLoading = false
            })
        },
        changeDepartment(v){
            this.departments = v

            this.resetWorker()
            this.resetPosition()

            if(this.isActivePanel(this.cols[2].id)){
                this.positionParams.department_id = this.departments?.[0]?.id
                this.getPosition()
            }
            else if(this.isActivePanel(this.cols[3].id)){
                this.workerParams.department_id = this.departments?.[0]?.id
                this.getWorker()
            }
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

            this.resetWorker()
            if(this.isActivePanel(this.cols[3].id)){
                this.workerParams.department_position_id = this.position
                this.getWorker()
            }
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

        resetWorker(){
            this.workerList =[]
        },
        resetPosition(){
            this.position = null
            this.positionList=[]
            this.positionParams.organization_id = null
            this.positionParams.department_id = null
        },
        resetDepartment(){
            this.departmentList = []
            this.departments = []
            this.depCheck = []
        }
    }

})