import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const usePolyclinicStore = defineStore('polyclinicStore', {
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
            polyclinics:[],
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
        },
        uuid:null,
    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                uuid:this.uuid,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.polyclinicService._index({params}).then((res)=>{
                this.list = res.data.data
                this.totalItems = res.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            const data = {
                ...this.payload
            }
            $ApiService.polyclinicService._create({data}).then((res)=>{
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
            $ApiService.polyclinicService._delete({id:this.elementId}).then((res)=>{
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
            this.payload.polyclinics = []
        },

    }

})