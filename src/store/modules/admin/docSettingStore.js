import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useDocSettingStore = defineStore('docSettingStore', {
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
            name:null,
            organizations:[],
            type:null,
            file:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        tabList:[
            {
                name:'documentSetting.tabs.example',
                id:1,
            },
            {
                name:'documentSetting.tabs.organizationService',
                id:2,
            },
        ],
        activeTab:2,
        checkedVal:[],
        selectedFileName:null,

    }),
    actions:{
        _index(){
            this.loading= true
            let params = {...this.params}
            params.organizations=this.payload.organizations.map((v)=>v.id).toString()
            $ApiService.docSettingService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            const formData =  new FormData()
            formData.append('name', this.payload.name)
            formData.append('type', this.payload.type)
            formData.append('organizations', this.payload.organizations.map((v)=>v.id).toString())
            formData.append('file', this.payload.file)

            $ApiService.docSettingService._create({data:formData}).then((res)=>{
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
                long:this.payload.marker.coords[0],
                lat:this.payload.marker.coords[1],
                region_id:this.payload.region_id,
            }
            $ApiService.docSettingService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.docSettingService._delete({id:this.elementId}).then((res)=>{
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
            this.payload.file = null
        }

    }

})