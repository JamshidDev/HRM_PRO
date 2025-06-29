import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
import Utils from "@/utils/Utils.js"
import {useAppSetting} from "@/utils/index.js"




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
        medStatus:[],
        organizationDocumentTypes:[],
        roles:[],
        giftTypes:[],
        fineTypes:[],
        financialAssistance:[],

        departmentList:[],
        depParams:{
            page:1,
            per_page:100,
            search:null,
            organizations:null,
        },
        departmentLoading:false,
        totalDepartment:0,

        allDepartmentTrees:[],
        allDepartmentLoading:false,



        positionList:[],
        positionLoading:false,

        params:{
            page:1,
            per_page:10000
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
        genderList:[
            {
                name:t('enum.man'),
                id:1,
            },
            {
                name:t('enum.woman'),
                id:0,
            },
        ],

        contractTypes:[],
        commandTypes:[],
        scheduleTypes:[],
        workDayTypes:[],
        holidayTypes:[],
        positionCategory:[],

        docExampleList:[],
        docExampleLoading:false,

        departmentPositionList:[],
        departmentPositionLoading:false,
        positionParams:{
            page:1,
            per_page:50,
            search:null,
        },
        totalPosition:0,

        confirmationList:[],
        confirmationLoading:false,

        isSelectedWorker:false,

        organizationServiceList:[],
        confirmationStatusList:[],
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
        workerParams:{
            page:1,
            per_page:50,
            search:null,
            organization_id:null,
            organizations:null,
        },
        totalWorker:0,

        adContractTypes:[],
        adContractTypeLoading:false,

        allCityList:[],
        allCityLoading:false,

        previewVisible:false,
        previewLoading:false,
        workerPreview:null,

        timesheetWorkplace: null,
        timesheetWorkplaceLoading: false,
        timesheetTypes: [],
        timesheetEnumsLoading: false,
        work_Types:[],
        reasonTypes:[],
        reasonTypeLoading:false,

        workerApplicationTypes:[],
        educationTypes:[],
        workerApplicationLoading:false,

        directorList:[],
        directorLoading:false,

        filterPositions:[],
        filterPositionLoading:false,
        filterPositionParams:{
            page:1,
            per_page:1000,
            search:null,
            departments:[],
        },
        resumeLoading:false,
        resumeId:null,

        allStructureList:[],
        allStructureLoading:false,
        allStructureParams:{
            page:1,
            per_page:1000,
            search:null,
        },

        turnstileBuildingList: [],
        turnstileBuildingListLoading: false,

        turnstileTerminalList: [],
        turnstileTerminalListLoading: false,
        panelVisible:false,

        fileVisible:false,
        fileLoading:false,
        files:[],

        universityTypes:[],
        vacationTypes:[],

        uploadTypes:[],
        accountantEnumLoading:false,
    }),
    actions:{
        _enumAccountant(){
            this.accountantEnumLoading= true
            $ApiService.accountantService._enum().then((res)=>{
                this.uploadTypes = res.data.data?.upload_types
            }).finally(()=>{
                this.accountantEnumLoading= false
            })
        },
        clearCache(){
            this.workerParams = {
                ...this.workerParams,
                search:null,
            }
        },
        _confirmFile(data, callback){
            this.fileLoading = true
            $ApiService.componentService._confirmByFile({data}).then((res)=>{
                callback?.()
            }).finally(()=>{
                this.fileLoading= false
            })
        },
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
                this.medStatus = res.data.data.med_statuses
                this.organizationDocumentTypes = res.data.data.organization_document_types
                this.roles = res.data.data.roles
                this.giftTypes = res.data.data.gift_types
                this.financialAssistance = res.data.data.financial_assistance
                this.fineTypes = res.data.data.fine_types
                this.vacationTypes = res.data.data.vacation_types
                this.work_Types = res.data.data.work_types

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
                this.positionCategory = res.data.data?.categories
                this.workDayTypes = res.data.data?.work_day_types
                this.holidayTypes=res.data.data?.holiday_types
                this.organizationServiceList = res.data.data?.organization_services
                this.confirmationStatusList = res.data.data?.confirmation_statuses
                this.universityTypes = res.data.data?.university_types
                this.educationTypes = res.data.data?.education_types


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
        _departments(infinity=false){
            this.departmentLoading= true
            let params = {
                ...this.depParams,
                organizations:this.depParams.organizations?.toString(),
            }
            $ApiService.componentService._departmentByOrganizations({params}).then((res)=>{
                this.totalDepartment = res.data.data.total
                let data = res.data.data.data.map((v)=>({...v, position:v?.organization?.name}))
                if(infinity){
                    this.departmentList =[...this.departmentList, ...data]
                }else{
                    this.departmentList = data
                }
            }).finally(()=>{
                this.departmentLoading= false
            })
        },
        _onSearchDepartment(v){
            this.depParams.page = 1
            this.depParams.search = v
            Utils.debouncedFn(this._departments)
        },
        onOpenDepartmentEv(v){
            if(!v) return
            this.depParams.search=null
            this.depParams.page=1
            this._departments()
        },
        _onScrollDepartment(e){
            const currentTarget = e.currentTarget;
            if(currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight && !this.departmentLoading && this.totalDepartment>this.departmentList.length){
                this.depParams.page +=1
                this._departments(true)
            }
        },
        _positions(){
            this.positionLoading = true
            $ApiService.positionService._index({params:this.params}).then((res)=>{
                this.positionList = res.data.data.data
            }).finally(()=>{
                this.positionLoading = false
            })
        },
        _filterPosition(){
            this.filterPositionLoading = true
            $ApiService.positionService._filterIndex({params:this.filterPositionParams}).then((res)=>{
                this.filterPositions = res.data.data.data
            }).finally(()=>{
                this.filterPositionLoading = false
            })
        },


        _checkWorker(pin, type){
            this.pinLoading = true
            this.worker = null
            $ApiService.workerService._checkWorker({params:{pin, type}}).then((res)=>{
                if(!res.data.error){
                    let data = res.data.data
                    this.worker =  {
                        lastName:data?.last_name,
                        firstName:data?.first_name,
                        middleName:data?.middle_name,
                        position:`${t('workerPage.checkWorker.born')} ${Utils.timeOnlyDate(data?.birthday)}`,
                        photo:data?.photo,
                        pin:data.id.toString()
                    }
                }

            }).finally(()=>{
                this.submitted = true
                this.pinLoading = false
            })
        },
        _regions(id=undefined){
            this.regionLoading = true
            const params = {
                ...this.params,
                country_id:id
            }
            $ApiService.regionService._index({params}).then((res)=>{
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
            $ApiService.nationalityService._index({params:this.params}).then((res)=>{
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

        _allStructures(){
            this.allStructureLoading= true
            $ApiService.componentService._allStructure({params:this.allStructureParams}).then((res)=>{
                this.allStructureList = res.data.data
            }).finally(()=>{
                this.allStructureLoading= false
            })
        },
        _departmentPosition(id = undefined){
            const params = {
                page:1,
                per_page:1000,
                department_id:id,
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
        _departmentTree(id=undefined){
            this.departmentLoading = true
            let params = {...this.depParams}
            $ApiService.componentService._departmentTree({params}).then((res)=>{
                this.departmentList = res.data.data
            }).finally(()=>{
                this.departmentLoading= false
            })
        },

        _departmentTreeList(id, callback){
            let params = {
                organizations:[id]
            }
            $ApiService.componentService._departmentTree({params}).then((res)=>{
                this.departmentList = res.data.data
                callback?.(res.data.data)
            })
        },
        _allDepartmentTree(id=undefined){
            this.allDepartmentLoading = true
            let params = {
                organization_id:id
            }
            $ApiService.componentService._allDepartmentTree({params}).then((res)=>{
                this.allDepartmentTrees = res.data.data
            }).finally(()=>{
                this.allDepartmentLoading = false
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


        _workers(infinity=false){
            this.workerLoading = true
            let params ={
                ...this.workerParams,
            }
            $ApiService.workerService._search({params}).then((res)=>{
                let data = res.data.data.data.map((v)=>({
                    ...v,
                    name:v.worker.last_name + ' '+v.worker.first_name+' '+v.worker.middle_name,
                    position:v.position?.name || v?.post_name,
                    id:v.id,
                    typeId:v.contract?.type?.id,
                    photo: v.worker?.photo
                }))
                this.totalWorker =res.data.data.total
                if(infinity){
                    this.workerList =[...this.workerList, ...data]
                }else{
                    this.workerList = data
                }

            }).finally(()=>{
                this.workerLoading = false
            })
        },
        onSearchWorker(v){
            this.workerParams.page = 1
            this.workerParams.search = v
            Utils.debouncedFn(this._workers)
        },
        onScrollWorker(e){
            const currentTarget = e.currentTarget;
            if(currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight && !this.workerLoading && this.totalWorker>this.workerList.length){
                this.workerParams.page +=1
                this._workers(true)
            }
        },
        onOpenWorkerEv(v){
            if(!v) return
            this.workerParams.search=null
            this.workerParams.page=1
            this._workers()
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
            this.resumeId=id
            $ApiService.workerService._preview({id}).then((res)=>{
                this.workerPreview = res.data.data
            }).finally(()=>{
                this.previewLoading = false
            })
        },
        _workerResume(){
            this.resumeLoading = true
            const id = this.resumeId
            const lang =localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage
            const photo = this.workerPreview.worker?.photos.filter(v=>v.current === 1)?.[0]?.id
            $ApiService.workerService._resume({id, params:{lang,photo }}).then((res)=>{
                console.log(res.headers)
                const type =res.headers["content-type"]
                const fileName =res.headers.get('Content-Disposition')

                console.log(fileName)
                Utils.blobFileDownload(res.data, type, fileName)
            }).finally(()=>{
                this.resumeLoading = false
            })
        },
        _timesheetDepartment(){
            this.timesheetWorkplaceLoading = true
            $ApiService.timesheetService._index_departments().then((res)=>{
                this.timesheetWorkplace = res.data.data
            }).finally(()=>{
                this.timesheetWorkplaceLoading = false
            })
        },
        _timesheetEnums(){
            this.timesheetEnumsLoading = true
            $ApiService.timesheetService._enumTimesheet().then((res)=>{
                this.timesheetTypes = res.data.data.timesheet_types
            }).finally(()=>{
                this.timesheetEnumsLoading = false
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
        },
        _workerApplicationEnums(){
            this.workerApplicationLoading = true
            $ApiService.componentService._workerApplicationEnum()
                .then((res)=>{
                    this.workerApplicationTypes = res.data.data.application_types.map((v)=>({...v, name:v.id+' - '+v.name}))
                    this.educationTypes = res.data.data.education_types
                }).finally(()=>{
                this.workerApplicationLoading = false
            })
        },
        _directors(id=undefined, callback){
            this.directorLoading = true
            $ApiService.componentService._directors({
                params:{
                    organizations:id
                }
            })
                .then((res)=>{
                    this.directorList = res.data.data.map((v)=>({
                        ...v,
                        name:Utils.combineFullName(v.worker)
                    }))
                    callback?.(this.directorList)

                }).finally(()=>{
                this.directorLoading = false
            })
        },
        _turnstileBuilding() {
            this.turnstileBuildingListLoading = true
            $ApiService.turnstileBuildingService._index({params: {...this.params}}).then((res) => {
                this.turnstileBuildingList = res.data.data.data
            }).finally(() => {
                this.turnstileBuildingListLoading = false
            })
        },
        _turnstileTerminal() {
            this.turnstileTerminalListLoading = true
            $ApiService.turnstileTerminalService._index({params: {...this.params}}).then((res) => {
                this.turnstileTerminalList = res.data.data.data
            }).finally(() => {
                this.turnstileTerminalListLoading = false
            })
        },
    }

})