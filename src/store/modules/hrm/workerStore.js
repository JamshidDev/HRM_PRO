import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useWorkerStore = defineStore('workerStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        payload:{
            pin:null,
            position:null,
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
            $ApiService.confirmationService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                uuid:this.payload.pin,
                position:this.payload.position,
            }
            $ApiService.confirmationService._create({data}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            let data = {
                uuid:this.payload.pin,
                position:this.payload.position,
            }
            $ApiService.confirmationService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.confirmationService._delete({id:this.elementId}).then((res)=>{
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.elementId = null
            this.payload.pin = null
            this.payload.position = null
        }

    }

})