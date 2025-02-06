import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useUniversityStore = defineStore('universityStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allRegionList:[],
        allLoading:false,
        payload:{
            uuid:null,
            university_id:null,
            speciality_id:null,
            from_date:null,
            to_date:null,
            file:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        uuid:null,
        universityList:[],
        universityLoading:false,

        specialityList:[],
        specialityLoading:false,

    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.universityService._index({params:{uuid:this.uuid}}).then((res)=>{
                this.list = res.data.data.data
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(data){
            this.saveLoading = true
            $ApiService.universityService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(data){
            this.saveLoading = true
            const params = {
                _method:"PUT"
            }
            $ApiService.universityService._update({data, id:this.elementId, params}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.universityService._delete({id:this.elementId}).then((res)=>{
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm() {
            this.elementId = null
            this.payload.uuid = null
            this.payload.university_id = null
            this.payload.speciality_id = null
            this.payload.from_date = null
            this.payload.to_date = null
            this.payload.file = null
        },
        _getUniversityList(){
            this.universityLoading = true
            $ApiService.universityServiceAdmin._index({params:{page:1, per_page:1000}}).then((res)=>{
                    this.universityList = res.data.data.data
            }).finally(()=>{
            this.universityLoading = false
            })
        },
        _getSpeciality(){
            this.specialityLoading = true
            $ApiService.specialityService._index({params:{page:1, per_page:1000}}).then((res)=>{
                this.specialityList = res.data.data.data
            }).finally(()=>{
            this.specialityLoading = false
            })

        }

    }

})