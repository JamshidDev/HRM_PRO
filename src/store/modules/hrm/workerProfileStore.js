import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useWorkerProfileStore = defineStore('workerProfileStore', {
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
            name:null,
            country_id:null,
            region_id:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        tabs:[
            {
                name:'workerProfile.tabs.personal',
                id:1,
            },
            {
                name:'workerProfile.tabs.education',
                id:2,
            },
            {
                name:'workerProfile.tabs.career',
                id:3,
            },
            {
                name:'workerProfile.tabs.relative',
                id:4,
            },
            {
                name:'workerProfile.tabs.others',
                id:5,
            },
        ],
        activeTab:1,

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