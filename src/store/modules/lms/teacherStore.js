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
            learning_center_id:null,
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
        searchQuery:null,
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
            this.loading = true
            $ApiService.teacherService._delete({id:this.elementId}).then((res)=>{
                this._index()
            })
        },
        _subjects(){
            this.subjectsLoading = true
            $ApiService.subjectService._index({params:{page:1, per_page:1000}}).then((res)=>{
                this.subjects =  res.data.data.data
            }).finally(()=>{
                this.subjectsLoading= false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.worker_id = null
            this.payload.learning_center_id = null
            this.payload.subjects = []
        }
    }
})