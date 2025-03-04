import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useAcademicTitleStore = defineStore('academicTitleStore', {
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
            uuid:null,
            type:null,
            file:[],
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        uuid:null,
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.academicTitleService._index({params:{uuid:this.uuid}}).then((res)=>{
                this.list = res.data.data
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(data){
            this.saveLoading = true
            $ApiService.academicTitleService._create({data}).then((res)=>{
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
            $ApiService.academicTitleService._update({data, id:this.elementId, params}).then((res)=>{
                this.visible = false
                this._index()
               
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.academicTitleService._delete({id:this.elementId}).then((res)=>{
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
            this.payload.type = null
            this.payload.file = []
        },

    }

})