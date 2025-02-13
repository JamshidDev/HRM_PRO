import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useOrganizationStore = defineStore('organizationStore', {
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
            parent_id:null,
            city_id:null,
            level:null,
            name:null,
            full_name:null,
            lat:null,
            long:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        levelLoading:false,
        levelList:[],
        showLoading:false,
        indexPath:null,
        parentElement:null,
        nestedPath:null,

    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.organizationService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data.map((v)=>({
                    name:v.name,
                    fullName:v.full_name,
                    id:v.id,
                    children:[],
                    isHaveChild:Boolean(v?.descendants)
                }))
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _level(){
            this.levelLoading= true
            $ApiService.organizationService._level().then((res)=>{
                this.levelList = res.data.data
            }).finally(()=>{
                this.levelLoading= false
            })
        },
        _show(){

            $ApiService.organizationService._show({id:this.elementId}).then((res)=>{
                let node = res.data.data.children.map((v)=>({
                    name:v.name,
                    fullName:v?.full_name,
                    id:v.id,
                    children:[],
                    isHaveChild:Boolean(v?.descendants)
                }))

                if(this.visibleType){
                    this.nestedElement(this.list, this.indexPath.slice(2).split('-'),node )
                }else{
                    let {organization} = res.data.data
                    this.elementId = organization.id
                    this.payload.name = organization.name
                    this.payload.full_name = organization.full_name
                    this.payload.level = organization.level
                    this.payload.parent_id = organization.parent_id
                    this.payload.city_id  = organization.city.id
                    this.visible = true

                }

            })
        },
        _create(){
            this.saveLoading = true
            let data = {...this.payload}
            $ApiService.organizationService._create({data}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            let data = {...this.payload}
            $ApiService.organizationService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.organizationService._delete({id:this.elementId}).then((res)=>{
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        _getCountryList(){
            this.allLoading= true
            $ApiService.countryService._index({params:{
                    page:1,
                    per_page:1000,
                }}).then((res)=>{
                this.allCountryList = res.data.data.data
            }).finally(()=>{
                this.allLoading= false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.elementId = null
            this.payload.name = null
            this.payload.parent_id = null
            this.payload.level = null
            this.payload.full_name = null
            this.payload.lat = null
            this.payload.long = null
            this.payload.city_id = null
        },
        nestedElement(node, indexPath, newNode){
            let currentNode = node
            for(const index of indexPath){
                const childIndex = parseInt(index, 10);
                if(Array.isArray(currentNode)){
                    currentNode = currentNode[childIndex]
                }else{
                    currentNode = currentNode.children[childIndex]
                }
            }
            currentNode.children = newNode
            this.indexPath = null
            return currentNode
        },

    }

})