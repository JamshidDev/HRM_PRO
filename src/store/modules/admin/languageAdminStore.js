import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useLanguageAdminStore = defineStore('languageAdminStore', {
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
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        tabList:[
            {
                id:1,
                name:`othersPage.tabs.university`
            },
            {
                id:2,
                name:`othersPage.tabs.speciality`
            },
            {
                id:3,
                name:`othersPage.tabs.language`
            },
        ],
        activeTab:1,

    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.languageServiceAdmin._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                name:this.payload.name,
            }
            $ApiService.languageServiceAdmin._create({data}).then((res)=>{
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
                name:this.payload.name,
            }
            $ApiService.languageServiceAdmin._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.languageServiceAdmin._delete({id:this.elementId}).then((res)=>{
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(v){
            this.visible = v
        },
        resetForm(){
            this.elementId = null
            this.payload.name = null
        }

    }

})