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
                const index = this.activePanels.findIndex(v=>v.id === id)
                if(index !== -1){
                    this.barList.push(this.activePanels[index])
                    this.activePanels.splice(index,1)

                }
            },0)

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
                this.activePanels.push(item)
                const idx = this.barList.findIndex(v=>v.id === item.id)
                if(idx !== -1){
                    this.barList.splice(idx,1)
                }

                if(item.id === 4){
                    this.barList.push(this.cols[0])
                    const l = this.activePanels.findIndex(v=>v.id === 1)
                    if(l !== -1){
                        this.activePanels.splice(l,1)
                    }

                }
                for(let index in this.cols){
                    let col = this.cols[index]

                   if(col.id > item.id){
                       const position = this.activePanels.findIndex(v=>v.id === col.id)
                       if(position !== -1){
                           this.activePanels.splice(position,1)
                       }
                       this.barList.push(col)

                   }
                }
            }

        },
        beforeOpen(item){
            if(item.id === 2){
                this.getDepartment()

            }else if(item.id === this.cols[2].id){
                this.resetPosition()
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
                if(res.data.data.length === 1 && res.data.data?.[0]?.children?.length === 0){
                    this.organizations = [res.data.data[0]]
                    this.addPanel(this.cols[1])
                }

            }).finally(()=>{
                this.organizationLoading = false
            })
        },
        changeOrg(v){
            this.organizations = v

            this.resetWorker()
            this.resetPosition()
            this.resetDepartment()

            this.positionParams.organization_id = this.organizations?.[0]?.id
            this.workerParams.organization_id = this.organizations?.[0]?.id
            this.positionParams.department_id = null
            this.workerParams.department_id = null
            this.workerParams.department_position_id = null
            this.position = null
            this.departments = []

            if(this.isActivePanel(this.cols[1].id)){
                this.getDepartment()
            }else if(this.isActivePanel(this.cols[2].id)){
                this.getPosition()
            }
            else if(this.isActivePanel(this.cols[3].id)){
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

            this.positionParams.department_id = this.departments?.[0]?.id
            this.workerParams.department_id = this.departments?.[0]?.id
            this.workerParams.department_position_id = null

            if(this.isActivePanel(this.cols[2].id)){
                this.getPosition()
            }
            else if(this.isActivePanel(this.cols[3].id)){
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
            this.positionList=[]
        },
        resetDepartment(){
            this.departmentList = []
            this.departments = []
            this.depCheck = []
        }
    }

})