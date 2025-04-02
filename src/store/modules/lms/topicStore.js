import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useTopicStore = defineStore('topicStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        showLoading: false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        payload:{
            name:null,
            type:null,
            organizations:[],
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
            $ApiService.topicService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _show(){
            this.showLoading= true
            $ApiService.topicService._show({id:this.elementId}).then((res)=>{
                const {type, organizations, name} = res.data.data
                this.payload.type = type.id
                this.payload.organizations = organizations
                this.payload.name = name
            }).finally(()=>{
                this.showLoading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                ...this.payload,
                organizations:this.payload.organizations.map(v=>v.id),

            }
            $ApiService.topicService._create({data}).then((res)=>{
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
                ...this.payload,
                organizations:this.payload.organizations.map(v=>v.id),
            }
            $ApiService.topicService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.topicService._delete({id:this.elementId}).then((res)=>{
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
            this.payload.name = null
            this.payload.type = null
            this.payload.organizations = []
        }

    }

})