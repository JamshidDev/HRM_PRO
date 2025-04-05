import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useTopicFileStore = defineStore('topicFileStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        topicId: null,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        payload:{
            fileObjects: [],
            active: false
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
            $ApiService.topicFilesService._index({params:this.params, id: this.topicId}).then((res)=>{
                this.list = res.data.data
            }).finally(()=> {
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            const formData = new FormData()
            formData.append('active', Number(this.payload.active))
            formData.append('file', this.payload.fileObjects[0].file)
            $ApiService.topicFilesService._create({data: formData, id: this.topicId}).then((res)=>{
                this.visible = false
                this._index()
                this.resetForm()
                
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            const formData = new FormData()
            formData.append('active', Number(this.payload.active))
            $ApiService.topicFilesService._update({data: formData, id:this.topicId, file_id: this.elementId}).then((res)=>{
                this._index()
                this.resetForm()
                
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.topicFilesService._delete({id:this.topicId, file_id: this.elementId}).then((res)=>{
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
            this.payload.fileObjects = []
            this.payload.active = false
        }
    }
})