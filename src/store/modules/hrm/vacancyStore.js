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
        switchLoading:false,
    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                organizations:this.params?.organizations?.map(v=>v.id)?.toString() || undefined,
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
        _show(){
            $ApiService.vacancyService._show({id:this.elementId}).then((res)=>{
                const v = res.data.data
                this.payload.department_position_id = v.department_position_id
                this.payload.region_id = v.city?.region?.id
                this.payload.city_id = v.city.id
                this.payload.education = v.education.id
                this.payload.rate = v.rate?.toString()
                this.payload.salary = v.salary?.toString()
                this.payload.experience = v.experience?.toString()
                this.payload.to = Utils.datePickerFormatter(v.to)
                this.payload.work_type = v.work_type.id
                this.payload.address = v.address
                this.payload.position_obligations = v.position_obligations
                this.payload.qualification_requirements = v.qualification_requirements
                this.payload.working_conditions = v.working_conditions
                this.payload.specialties = v.specialties
                this._cities(this.payload.region_id)
                this.visibleType = false
                this.visible = true
            }).finally(()=>{
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
                to:Utils.timeToZone(this.payload.to),
            }
            $ApiService.vacancyService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _changePublic(v, item){
            this.elementId = item.id
            this.switchLoading = true
            const data = {
                status:v
            }
            $ApiService.vacancyService._update({data, id:this.elementId}).then((res)=>{
            }).finally(()=>{
                this.switchLoading = false
            })

        },
        _delete(){
            this.deleteLoading = true
            $ApiService.vacancyService._delete({id:this.elementId}).then((res)=>{
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
            this.payload.department_position_id = null
            this.payload.region_id = null
            this.payload.city_id = null
            this.payload.address = null
            this.payload.work_type = null
            this.payload.education = null
            this.payload.rate = null
            this.payload.salary = null
            this.payload.experience = null
            this.payload.to = null
            this.payload.position_obligations = ''
            this.payload.qualification_requirements = ''
            this.payload.working_conditions = ''
            this.payload.specialties = ''
        },

    }

})