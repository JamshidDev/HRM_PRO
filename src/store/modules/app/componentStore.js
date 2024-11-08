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

        departmentList:[],
        departmentLoading:false,

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
            $ApiService.componentService._organization({
                page:1,
                size:1000
            }).then((res)=>{
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
            }).finally(()=>{
                this.enumLoading= false
            })
        },
        _departments(){
            this.departmentLoading= true
            $ApiService.componentService._departments({
                page:1,
                per_page:1000
            }).then((res)=>{
                this.departmentList = res.data.data
            }).finally(()=>{
                this.departmentLoading= false
            })
        },

    }

})