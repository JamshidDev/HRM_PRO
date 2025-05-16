import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useUniversityAdminStore = defineStore('universityAdminStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        payload:{
            name:null,
            name_ru:null,
            region_id:null,
            city_id:null,
            education:null,
            type:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        districtList:[],
        districtLoading:false,
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.universityServiceAdmin._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {...this.payload}
            $ApiService.universityServiceAdmin._create({data}).then((res)=>{
                this.visible = false
                this._index()
                
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _getDistrict(){
            this.districtLoading = true
            $ApiService.districtService._index({params:{region_id:this.payload.region_id, page:1, per_page:10000}}).then((res)=>{
                this.districtList = res.data.data.data
            }).finally(()=>{
                this.districtLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            let data = {...this.payload}
            $ApiService.universityServiceAdmin._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.universityServiceAdmin._delete({id:this.elementId}).then((res)=>{
                this._index()
                
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(v){
            this.visible = v
        },
        resetForm(){
            this.elementId = null
            this.payload.name = null
            this.payload.name_ru = null
            this.payload.region_id = null
            this.payload.education = null
            this.payload.city_id = null
            this.payload.type = null
        }

    }

})