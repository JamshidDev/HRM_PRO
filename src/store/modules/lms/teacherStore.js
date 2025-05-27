import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useTeacherStore = defineStore('teacherStore', {
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
        structureCheck:[],
        payload:{
            worker_id: null,
            subjects: []
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        subjectsParams:{
            page:1,
            per_page:10,
            search:null,
        },
        subjects: [],
        subjectsLoading: false,
        subjectsTotal: 0,
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.teacherService._index({params:this.params}).then((res)=>{
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
            }
            $ApiService.teacherService._create({data}).then((res)=>{
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
            $ApiService.teacherService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.teacherService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
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
            this.payload.name = null
            this.payload.name_ru = null
            this.payload.name_en = null
            this.payload.direction_id = null
            this.payload.positions = []
        }
    }
})