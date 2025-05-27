import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useEduPlanStore = defineStore('eduPlanStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        showLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        specializationsParams:{
            page:1,
            per_page:10,
            search:null,
        },
        specializations: [],
        specializationsLoading: false,
        specializationsTotal: 0,
        subjectsParams:{
            page:1,
            per_page:10,
            search:null,
        },
        subjects: [],
        subjectsLoading: false,
        subjectsTotal: 0,
        payload:{
            specialization_id: null,
            start_date: null,
            hours: null,
            subjects: [],
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.eduPlanService._index({params:this.params}).then((res)=>{
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
                start_date: Utils.timeToZone(this.payload.start_date)
            }
            $ApiService.eduPlanService._create({data}).then((res)=>{
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
            }
            $ApiService.eduPlanService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _show(){
            this.showLoading = true
            $ApiService.eduPlanService._show({id:this.elementId}).then((res)=>{
                const v = res.data.data
                this.payload.name = v.name
                this.payload.name_ru = v.name_ru
                this.payload.name_en = v.name_en
                this.payload.positions = v.positions.map(i=>i.id)
                this.payload.direction_id = v.direction?.id
            }).finally(()=>{
                this.showLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.eduPlanService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        _specializations(infinite){
            this.specializationsLoading = true
            const params = {...this.specializationsParams}
            $ApiService.specializationService._index({params}).then((res)=>{
                const newData = res.data.data.data
                const oldData = this.specializations
                const data = infinite ? [...oldData, ...newData] : [...newData]
                if(this.payload.specialization_id){
                    if(!data.find(i=>i.id===this.payload.specialization_id)){
                        data.push(oldData.find(i=>i.id===this.payload.direction_id))
                    }
                }
                this.specializations = data
                this.specializationsTotal = res.data.data.total
            }).finally(()=>{
                this.specializationsLoading= false
            })
        },
        onSearchSpecializations(v){
            this.specializationsParams.page =1
            this.specializationsParams.search =v
            Utils.debouncedFn(this._specializations)
        },
        onScrollSpecializations(e){
            const currentTarget = e.currentTarget;
            if(currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight && !this.specializationsLoading && this.specializationsTotal>this.specializations.length){
                this.specializationsParams.page += 1
                this._specializations(true)
            }
        },
        _subjects(infinite){
            this.subjectsLoading = true
            const params = {...this.subjectsParams}
            $ApiService.subjectService._index({params}).then((res)=>{
                const newData = res.data.data.data
                const oldData = this.subjects
                const data = infinite ? [...oldData, ...newData] : [...newData]
                this.payload.subjects.forEach(subject => {
                    if(!data.find(i=>i.id===subject)){
                        data.push(oldData.find(i=>i.id===subject))
                    }
                })
                this.subjects = data
                this.subjectsTotal = res.data.data.total
            }).finally(()=>{
                this.subjectsLoading= false
            })
        },
        onSearchSubjects(v){
            this.subjectsParams.page =1
            this.subjectsParams.search =v
            Utils.debouncedFn(this._subjects)
        },
        onScrollSubjects(e){
            const currentTarget = e.currentTarget;
            if(currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight && !this.subjectsLoading && this.subjectsTotal>this.subjects.length){
                this.subjectsParams.page += 1
                this._subjects(true)
            }
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.specialization_id = null
            this.payload.start_date = null
            this.payload.hours = null
            this.payload.subjects = []
        }
    }
})