import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useMilitaryStore = defineStore('militaryStore', {
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
            status:null,
            name:null,
            number:null,
            speciality:null,
            commissariat:null,
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
            $ApiService.militaryService._index({params:{uuid:this.uuid}}).then((res)=>{
                this.list = res.data.data
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            const data = {
                ...this.payload,
                uuid:this.uuid,
            }
            $ApiService.militaryService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
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
            this.payload.uuid = null
            this.payload.status = null
            this.payload.name = null
            this.payload.number = null
            this.payload.speciality = null
            this.payload.commissariat = null
        },

    }

})