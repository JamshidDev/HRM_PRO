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

        departmentList:[],
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
        pinLoading:false,
        submitted:false,

        regionList:[],
        regionLoading:false,

        countryList:[],
        countryLoading:false,

        nationalityList:[],
        nationalityLoading:false,

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
        ]

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
            }).finally(()=>{
                this.enumLoading= false
            })
        },
        _departments(){
            this.departmentLoading= true
            $ApiService.componentService._departments(this.params).then((res)=>{
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
            $ApiService.workerService._checkWorker({params:{pin}}).then((res)=>{
                this.worker = null
                if(res.data.data){
                    let data = res.data.data
                    this.worker =  {
                        lastName:data?.last_name,
                        firstName:data?.first_name,
                        middleName:data?.middle_name,
                        position:`${t('workerPage.checkWorker.born')} ${Utils.timeOnlyDate(data?.birthday)}`,
                        photos:data.photos.length>0? data.photos[0] : Utils.noAvailableImage ,
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
        }


    }

})