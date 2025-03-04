import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
import Utils from "@/utils/Utils.js"
export const useComponentStore = defineStore('componentStore', {
    state:()=>({
        organizationLevelList:[],
        organizationLevelLoading:false,

        organizationList:[],
        organizationLoading:false,

        enumLoading:false,
        academicDegreeList:[],
        academicTitleList:[],
        contractTypeList:[],
        educationList:[],
        partyList:[],
        rankList:[],
        groupList:[],
        militaryStatuses:[],
        applicationTypes:[],
        workTypes:[],
        vacationAdditional:[],

        departmentList:[],
        depParams:{
            page:1,
            per_page:1000,
            search:null,
            organizations:null,
        },
        departmentLoading:false,

        positionList:[],
        positionLoading:false,

        params:{
            page:1,
            per_page:1000
        },

        checkUserVisible:false,
        pin:null,
        worker:null,
        selectedWorker:null,
        pinLoading:false,
        submitted:false,

        regionList:[],
        regionLoading:false,

        countryList:[],
        countryLoading:false,

        nationalityList:[],
        nationalityLoading:false,

        relativesList:[],
        maritalList:[],
        languageList:[],
        confirmationLevels:[],

        structureList:[],
        structureLoading:false,
        structureParams:{
            page:1,
            per_page:1000,
            search:null,
        },
        logStatusList:[
            {
                name:t('actionLog.status.created'),
                id:'created'
            },
            {
                name:t('actionLog.status.updated'),
                id:'updated'
            },
            {
                name:t('actionLog.status.deleted'),
                id:'deleted'
            },
        ],

        contractTypes:[],
        commandTypes:[],
        scheduleTypes:[],
        workDayTypes:[],
        holidayTypes:[],

        docExampleList:[],
        docExampleLoading:false,

        departmentPositionList:[],
        departmentPositionLoading:false,

        confirmationList:[],
        confirmationLoading:false,

        isSelectedWorker:false,

        organizationServiceList:[],
        enumAdminLoading:false,

        vacationList:[],

        scheduleList:[],
        scheduleLoading:false,

        probationList:[],

        enumExamLoading:false,
        topicTypes:[],
        topicWhomList:[],
        topicFileTypes:[],

        examCategoryLoading: false,
        examCategoryList: [],

        commandTypeList:[],
        commandTypeLoading:false,

        workerList:[],
        workerLoading:false,

        adContractTypes:[],
        adContractTypeLoading:false,

        allCityList:[],
        allCityLoading:false,

        previewVisible:false,
        previewLoading:false,
        workerPreview:null,

        reasonTypes:[],
        reasonTypeLoading:false,


    }),
    actions:{
        _organizationLevel(){
            this.organizationLevelLoading= true
            $ApiService.organizationService._level().then((res)=>{
                this.organizationLevelList = res.data.data
            }).finally(()=>{
                this.organizationLevelLoading= false
            })
        },
        _organizations(){
            this.organizationLoading= true
            $ApiService.componentService._organization(this.params).then((res)=>{
                this.organizationList = res.data.data
            }).finally(()=>{
                this.organizationLoading= false
            })
        },
        _enums(){
            this.enumLoading= true
            $ApiService.componentService._enums().then((res)=>{
                this.academicDegreeList = res.data.data.academic_degrees
                this.academicTitleList = res.data.data.academic_titles
                this.contractTypeList = res.data.data.contract_types
                this.educationList = res.data.data.educations
                this.partyList = res.data.data.parties
                this.groupList = res.data.data.groups
                this.rankList = res.data.data.ranks
                this.probationList = res.data.data.probation_list
                this.relativesList = res.data.data.relatives
                this.maritalList = res.data.data.marital_statuses
                this.languageList = res.data.data.languages
                this.militaryStatuses = res.data.data.military_statuses
                this.confirmationLevels = res.data.data.confirmation_worker
                this.applicationTypes = res.data.data.contract_application_types
                this.workTypes =res.data.data.create_application_types
                this.vacationAdditional = res.data.data.vacation_additional
            }).finally(()=>{
                this.enumLoading= false
            })
        },
        _enumsAdmin(){
            this.enumAdminLoading= true
            $ApiService.componentService._enumAdmin().then((res)=>{
                this.contractTypes = res.data.data?.contract_types
                this.commandTypes = res.data.data?.command_types
                this.scheduleTypes = res.data.data?.schedules
                this.workDayTypes = res.data.data?.work_day_types
                this.holidayTypes=res.data.data?.holiday_types
                this.organizationServiceList = res.data.data?.organization_services
            }).finally(()=>{
                this.enumAdminLoading= false
            })
        },
        _enumExam(){
            this.enumExamLoading= true
            $ApiService.componentService._enumExam().then((res)=>{
                this.topicTypes = res.data.data?.topic_types
                this.topicWhomList = res.data.data?.topic_whom
                this.topicFileTypes = res.data.data?.topic_file_types
            }).finally(()=>{
                this.enumExamLoading= false
            })
        },
        _examCategory(){
            this.examCategoryLoading = true
            $ApiService.componentService._examCategory({params: {...this.params}}).then((res)=>{
                this.examCategoryList = res.data.data.data
            }).finally(()=>{
                this.examCategoryLoading = false
            })
        },
        _docExample(){
            this.docExampleLoading = true
            $ApiService.componentService._docExample({params:this.params}).then((res)=>{
                this.docExampleList = res.data.data.map((v)=>({
                    name:v.name,
                    id:v.id
                }))
            }).finally(()=>{
                this.docExampleLoading = false
            })
        },
        _departments(id){
            this.departmentLoading= true
            let params = {...this.params}
            params.organization_id = id
            console.log(params)
            $ApiService.componentService._departments({params}).then((res)=>{
                this.departmentList = res.data.data
            }).finally(()=>{
                this.departmentLoading= false
            })
        },
        _positions(){
            this.positionLoading = true
            $ApiService.positionService._index(this.params).then((res)=>{
                this.positionList = res.data.data.data
            }).finally(()=>{
                this.positionLoading = false
            })
        },
        _checkWorker(pin){
            this.pinLoading = true
            this.worker = null
            $ApiService.workerService._checkWorker({params:{pin}}).then((res)=>{
                if(!res.data.error){
                    let data = res.data.data
                    this.worker =  {
                        lastName:data?.last_name,
                        firstName:data?.first_name,
                        middleName:data?.middle_name,
                        position:`${t('workerPage.checkWorker.born')} ${Utils.timeOnlyDate(data?.birthday)}`,
                        photo:data.photo,
                        pin:data.id.toString()
                    }
                }

            }).finally(()=>{
                this.submitted = true
                this.pinLoading = false
            })
        },
        _regions(){
            this.regionLoading = true
            $ApiService.regionService._index(this.params).then((res)=>{
                this.regionList = res.data.data.data
            }).finally(()=>{
                this.regionLoading = false
            })
        },
        _countries(){
            this.countryLoading = true
            $ApiService.countryService._index(this.params).then((res)=>{
                this.countryList = res.data.data.data
            }).finally(()=>{
                this.countryLoading = false
            })
        },
        _nationality(){
            this.nationalityLoading = true
            $ApiService.nationalityService._index(this.params).then((res)=>{
                this.nationalityList = res.data.data.data
            }).finally(()=>{
                this.nationalityLoading = false
            })
        },
        _structures(){
            this.structureLoading= true
            $ApiService.componentService._structure({params:this.structureParams}).then((res)=>{
                this.structureList = res.data.data
            }).finally(()=>{
                this.structureLoading= false
            })
        },
        _departmentPosition(id){
            const params = {
                page:1,
                per_page:1000,
                department_id:id
            }
            this.departmentPositionLoading = true
            $ApiService.departmentPositionService._index({params}).then((res)=>{
                this.departmentPositionList = res.data.data.data.map((v)=>({
                    name:v.position.name,
                    id:v.id,
                }))
            }).finally(()=>{
                this.departmentPositionLoading = false
            })
        },
        _confirmations(){
            this.confirmationLoading = true
            $ApiService.confirmationService._index({params:this.params}).then((res)=>{
                this.confirmationList = res.data.data.data.map((v)=>({position:v.position, ...v.worker, id:v.id}))
            }).finally(()=>{
                this.confirmationLoading = false
            })
        },
        _departmentTree(id){
            this.departmentLoading = true
            let params = {...this.depParams}
            $ApiService.componentService._departmentTree({params}).then((res)=>{
                this.departmentList = res.data.data
            }).finally(()=>{
                this.departmentLoading= false
            })
        },
        _scheduleList(){
            this.scheduleLoading = true
            $ApiService.scheduleService._index(this.params).then((res)=>{
                this.scheduleList = res.data.data.data
            }).finally(()=>{
                this.scheduleLoading = false
            })
        },
        _commandTypes(data){
            this.commandTypeLoading = true
            $ApiService.componentService._commandTypes({params:data}).then((res)=>{
                this.commandTypeList = res.data.data.map((v)=>({...v, name:v.id+' - '+v.name}))
            }).finally(()=>{
                this.commandTypeLoading = false
            })
        },
        _workers(id=undefined){
            this.workerLoading = true
            $ApiService.workerService._index({params:{page:1, per_page: 10000, organization_id:id}}).then((res)=>{
                this.workerList = res.data.data.data.map((v)=>({
                    ...v,
                    name:v.worker.last_name + ' '+v.worker.first_name+' '+v.worker.middle_name,
                    position:v.position?.name || v?.post_name,
                    id:v.id,
                    typeId:v.contract.type.id,

                }))
            }).finally(()=>{
                this.workerLoading = false
            })
        },
        _adContractType(id){
            this.adContractTypeLoading = true
            $ApiService.componentService._contractAddition({params:{contract_type:id}}).then((res)=>{
                this.adContractTypes = res.data.data
            }).finally(()=>{
                this.adContractTypeLoading = false
            })
        },
        _allCities(){
            this.allCityLoading = true
            $ApiService.districtService._index({params:{
                page:1, per_page:1000
                }}).then((res)=>{
                this.allCityList = res.data.data.data
            }).finally(()=>{
                this.allCityLoading = false
            })
        },
        _workerPreview(id){
            this.previewLoading = true
            $ApiService.workerService._preview({id}).then((res)=>{
                this.workerPreview = res.data.data
            }).finally(()=>{
                this.previewLoading = false
            })
        },
        _reasonTypes(id){
            this.reasonTypeLoading = true
            $ApiService.vacationService._reasonTypes({params:{type:id}})
                .then((res)=>{
                this.reasonTypes = res.data.data
            }).finally(()=>{
                this.reasonTypeLoading = false
            })
        }



    }

})