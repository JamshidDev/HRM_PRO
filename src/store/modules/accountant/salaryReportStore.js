
import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useSalaryReportStore = defineStore('salaryReportStore', {
    state:()=>({
        list:[],
        loading:false,
        showLoading:false,
        downloadLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        payload:{
        },
        params:{
            search:null,
            organizations:[],
            year:null,
            month:null,
        },
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
        activeTab:2,
        structureCheck2:[],
        organizationList:[],
        organizationData:[],
        organizationCount:0,
        expandList:[1,2,3,4,5,6]

    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.salaryReportService._indexByMonth({params}).then((res)=>{
                this.list = res.data.data.filter((_, index)=>index>2)
            }).finally(()=>{
                this.loading= false
            })
        },
        _indexOrg(){
            this.loading= true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.salaryReportService._indexByOrg({params}).then((res)=>{
                const {type_name,type_code,total_year, ...organizations} =  res.data.data[0]
                this.organizationList=organizations
                this.organizationData =res.data.data.filter((_, index)=>index>2).map((v,index)=>({id:index+1 , ...v}))

            }).finally(()=>{
                this.loading= false
            })
        },
        _download(){
            this.downloadLoading = true
            $ApiService.taxFiveService._template().then((res)=>{
                Utils.downloadFileByUrl(res.data.data.url)
            }).finally(()=>{
                this.downloadLoading = false
            })
        },

        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.elementId = null
            this.payload.name = null
        }

    }

})