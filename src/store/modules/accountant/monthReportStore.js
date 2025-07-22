import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useMonthReportStore = defineStore('monthReportStore', {
    state:()=>({
        list:[],
        loading:false,
        showLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        payload:{
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
            code:null,
            year:null,
            month:null,
            sort_by:null,
            sort_order:1
        },
        structureCheck2:[],
        showList:[],
        showPrams:{
            year:null,
            month:null,
        },
        codeList:[],
        enumLoading:false,
        workerPhotoUrl:null,
        downloadLoading:false,
        cashedWorkerData:null,

    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
                sort_order:(this.params.sort_by === 'status' || this.params.sort_by === null)? undefined : this.params.sort_order === 1 ? 'asc' : 'desc',
                status:this.params.sort_by === 'status'? this.params.sort_order === 1 ? 1 : undefined : undefined,
                sort_by:this.params.sort_by === 'status' ? undefined: this.params.sort_by,
            }
            $ApiService.monthReportService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _show(){
            this.showLoading = true
            let params = {
                year:this.showPrams.year,
                month:this.showPrams.month,
            }
            let id = this.elementId
            $ApiService.monthReportService._show({params, id}).then(async (res)=>{
                if(res.data.data.length>0){
                    this.cashedWorkerData = res.data.data[0]?.worker
                }
                this.showList=[]
                await nextTick()
                this.showList = res.data.data
            }).finally(()=>{
                this.showLoading = false
            })
        },
        _enum(){
            this.enumLoading= true
            $ApiService.accountantService._enum().then((res)=>{
                this.codeList = Object.entries(res.data.data.codes).map(([key,value])=>({
                    id:key,
                    name:value,
                    position:key,
                }))
            }).finally(()=>{
                this.enumLoading= false
            })
        },
        _download(){
            this.downloadLoading = true
            $ApiService.monthReportService._template().then((res)=>{
                Utils.downloadFileByUrl(res.data.data.url)
            }).finally(()=>{
                this.downloadLoading = false
            })
        },
        _filterCol(key){
            this.params.sort_by = key
            this.params.sort_order *= -1;
            this._index()
        },
        _filterStatus(key){
            this.params.sort_order = this.params.sort_by !== key? 1:this.params.sort_order ===1 ? -1 : 1
            this.params.sort_by = key
            this._index()
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