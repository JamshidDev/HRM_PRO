import {defineStore} from "pinia";
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
        }

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
        }

    }

})