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
        totalUniversity:0,
        universityParam:{
            page:1,
            per_page:50,
            search:null,
        },

        specialityList:[],
        totalSpecial:0,
        specialityLoading:false,
        specialParam:{
            page:1,
            per_page:50,
            search:null,
        }

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
               
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.universityService._delete({id:this.elementId}).then((res)=>{
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
            this.payload.uuid = null
            this.payload.university_id = null
            this.payload.speciality_id = null
            this.payload.from_date = null
            this.payload.to_date = null
            this.payload.file = null
        },
        _getUniversityList(infinity){
            this.universityLoading = true
            $ApiService.universityServiceAdmin._index({params:this.universityParam}).then((res)=>{
                this.totalUniversity = res.data.data.total
                const data = res.data.data.data
                this.universityList =infinity? [...this.universityList, ...data]:data
            }).finally(()=>{
            this.universityLoading = false
            })
        },
        onSearchUniversity(v){
            this.universityParam.page = 1
            this.universityParam.search = v
            Utils.debouncedFn(this._getUniversityList)
        },
        onScrollUniversity(e){
            const currentTarget = e.currentTarget;
            if(currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight && !this.universityLoading && this.totalUniversity>this.universityList.length){
                this.universityParam.page +=1
                this._getUniversityList(true)
            }
        },


        _getSpeciality(infinity=false){
            this.specialityLoading = true
            $ApiService.specialityService._index({params:this.specialParam}).then((res)=>{
                this.totalSpecial = res.data.data.total
                const data = res.data.data.data
                this.specialityList =infinity? [...this.specialityList, ...data] : data
            }).finally(()=>{
            this.specialityLoading = false
            })
        },
        onSearchSpecial(v){
            this.specialParam.page = 1
            this.specialParam.search = v
            Utils.debouncedFn(this._getSpeciality)
        },
        onScrollSpecial(e){
            const currentTarget = e.currentTarget;
            if(currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight && !this.specialityLoading && this.totalSpecial>this.specialityList.length){
                this.specialParam.page +=1
                this._getSpeciality(true)
            }
        }

    }

})