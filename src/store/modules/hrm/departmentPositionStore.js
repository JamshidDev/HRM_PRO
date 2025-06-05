import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
import {useComponentStore} from "@/store/modules/index.js"

export const useDepartmentPositionStore = defineStore('departmentPositionStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allCountryList:[],
        allLoading:false,
        payload:{
            organization_id:[],
            position_id:null,
            department_id:null,
            group:null,
            rank:null,
            max_rank:null,
            rate:null,
            salary:null,
            experience:null,
            education:null,
            organizations:[],
            departments:[],
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
            departments:[],
        },

    }),
    actions:{
        onChangeStructure(v){
            const store = useComponentStore()
            this.payload.organization_id = v
            store.departmentList = []
            this.payload.department_id = null
            store.depParams.organizations = v.length>0? [v?.[0]?.id] : []

        },
        _index(){
            this.loading= true
            let params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
                departments:this.params.departments.toString() || undefined,
            }
            $ApiService.departmentPositionService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                ...this.payload,
                organization_id:undefined}
            $ApiService.departmentPositionService._create({data}).then((res)=>{
                this.visible = false
                this._index()
               
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            let data = {
                ...this.payload,
                organization_id:undefined}
            $ApiService.departmentPositionService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
               
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.departmentPositionService._delete({id:this.elementId}).then((res)=>{
                this._index()
               
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.elementId = null
            this.payload.position_id = null
            this.payload.organization_id = []
            this.payload.department_id = null
            this.payload.group = null
            this.payload.rank = null
            this.payload.max_rank = null
            this.payload.rate = null
            this.payload.salary = null
            this.payload.experience = null
            this.payload.education = null
        },

    }

})