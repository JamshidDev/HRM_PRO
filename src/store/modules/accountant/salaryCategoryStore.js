import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useSalaryCategoryStore = defineStore('salaryCategoryStore', {
    state:()=>({
        list:[],
        loading:false,
        deleteLoading:false,
        saveLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        payload:{
            year: null,
            month: null,
            external_worker_count: null,
            external_salary_fund: null,
            capital_society_worker_count: null,
            capital_society_salary_fund: null,
            capital_own_use_worker_count: null,
            capital_own_use_salary_fund: null,
            capital_foreign_company_worker_count: null,
            capital_foreign_company_salary_fund: null,
            construction_society_worker_count: null,
            construction_society_salary_fund: null,
            construction_own_use_worker_count: null,
            construction_own_use_salary_fund: null,
            construction_foreign_company_worker_count: null,
            construction_foreign_company_salary_fund: null,
            other_society_worker_count: null,
            other_society_salary_fund: null,
            other_own_use_worker_count: null,
            other_own_use_salary_fund: null,
            other_foreign_company_worker_count: null,
            other_foreign_company_salary_fund: null,
            temporary_contract_worker_count: null,
            temporary_contract_salary_fund: null,
            civil_contract_worker_count: null,
            civil_contract_salary_fund: null,
            freelancer_worker_count: null,
            freelancer_salary_fund: null
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
            year:null,
            month:null,
        },
        structureCheck2:[],
        tabs:[
            {
                name:t('salaryCategory.tab.month'),
                id:1,
            },
            {
                name:t('salaryCategory.tab.organization'),
                id:2,
            },
        ],
        activeTab:1,
        organizationList:[],
        expandSet:new Set(),

    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            console.log(params)
            $ApiService.salaryCategoryService._index({params}).then((res)=>{
                this.list = res.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _byOrganization(){
            this.loading= true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.salaryCategoryService._byOrganization({params}).then((res)=>{
                this.organizationList = res.data.data
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(data){
            this.saveLoading = true
            $ApiService.salaryCategoryService._store({data}).then((res)=>{
                this.visible = false
               this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _update(data){
            this.saveLoading = true
            $ApiService.salaryCategoryService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.salaryCategoryService._delete({id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },


        openVisible(data){
            this.visible = data
        },
        resetForm() {
            this.elementId = null
            this.payload.year = new Date().getFullYear()
            this.payload.month = new Date().getMonth()
            this.payload.external_worker_count = 0
            this.payload.external_salary_fund = 0
            this.payload.capital_society_worker_count = 0
            this.payload.capital_society_salary_fund = 0
            this.payload.capital_own_use_worker_count = 0
            this.payload.capital_own_use_salary_fund = 0
            this.payload.capital_foreign_company_worker_count = 0
            this.payload.capital_foreign_company_salary_fund = 0
            this.payload.construction_society_worker_count = 0
            this.payload.construction_society_salary_fund = 0
            this.payload.construction_own_use_worker_count = 0
            this.payload.construction_own_use_salary_fund = 0
            this.payload.construction_foreign_company_worker_count = 0
            this.payload.construction_foreign_company_salary_fund = 0
            this.payload.other_society_worker_count = 0
            this.payload.other_society_salary_fund = 0
            this.payload.other_own_use_worker_count = 0
            this.payload.other_own_use_salary_fund = 0
            this.payload.other_foreign_company_worker_count = 0
            this.payload.other_foreign_company_salary_fund = 0
            this.payload.temporary_contract_worker_count = 0
            this.payload.temporary_contract_salary_fund = 0
            this.payload.civil_contract_worker_count = 0
            this.payload.civil_contract_salary_fund = 0
            this.payload.freelancer_worker_count = 0
            this.payload.freelancer_salary_fund = 0


        }

    }

})