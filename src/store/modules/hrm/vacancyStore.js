import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useVacancyStore = defineStore('vacancyStore', {
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
            department_position_id:null,
            region_id:null,
            city_id:null,
            address:null,
            work_type:null,
            education:null,
            rate:null,
            salary:null,
            experience:null,
            to:null,
            position_obligations:'',
            qualification_requirements:'',
            working_conditions:'',
            specialties:'',
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
            vacation_type:null,
        },
        positionLoading:false,
        vacancyPositions:[],
        cityList:[],
        cityLoading:false,
    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                uuid:this.uuid,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.vacancyService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            const data = {
                ...this.payload,
                to:Utils.timeToZone(this.payload.to),
            }
            $ApiService.vacancyService._store({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _vacancyPositions(){
            this.positionLoading = true
            $ApiService.vacancyService._vacancyPosition({page:1, per_page:1000}).then((res)=>{
                this.vacancyPositions = res.data.data.positions.map((v)=>({
                    ...v,
                    name:v.position,
                    position:v.department,
                    city:res.data.data?.city
                }))
            }).finally(()=>{
                this.positionLoading = false
            })
        },
        _cities(v){
            this.cityLoading = true
            $ApiService.districtService._index({params:{page:1,per_page:1000, region_id:v}}).then((res)=>{
                this.cityList = res.data.data.data
            }).finally(()=>{
                this.cityLoading = false
            })
        },
        _update(){
            this.saveLoading = true
            const data = {
                ...this.payload,
                uuid:this.uuid,
            }
            $ApiService.militaryService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()

            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.militaryService._delete({id:this.elementId}).then((res)=>{
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
        },

    }

})