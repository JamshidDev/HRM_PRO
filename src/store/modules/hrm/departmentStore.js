import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useDepartmentStore = defineStore('departmentStore', {
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
            level:null,
            name:null,
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
        tabList:[
            {
                name:'Asosiy',
                key:1,
                parentId:null,
            }
        ],
        activeTab:1,
        tabDataList:[],
        id:null,

        activeDeep:null,
        activeParentId:null,


    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.departmentService._index({params:this.params}).then((res)=>{
                this.tabDataList[0] = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _level(){
            this.levelLoading= true
            $ApiService.departmentService._level().then((res)=>{
                this.levelList = res.data.data
            }).finally(()=>{
                this.levelLoading= false
            })
        },
        _show(){
            $ApiService.departmentService._show({id:this.elementId}).then((res)=>{
                console.log(res.data)
            })
        },
        _create(){
            this.saveLoading = true
            let data = {...this.payload}
            $ApiService.departmentService._create({data}).then((res)=>{
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
            $ApiService.departmentService._delete({id:this.elementId}).then((res)=>{
                this.activeTab = 1
                this.tabList = this.tabList.filter((v,idx)=>idx === 0)
                this.tabDataList = this.tabDataList.filter((v,idx)=>idx === 0)
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
            this.payload.parent_id = null
            this.payload.level = null
        },
        goDeep(v){
            this.id = v.id
            const currentTab = v.deep

            $ApiService.departmentService._show({id:v.id}).then((res)=>{
                this.tabList = this.tabList.filter((x)=>x.key<=currentTab)
                this.tabDataList =  this.tabDataList.filter((x,idx)=>idx<currentTab)
                this.tabList.push({
                    name:res.data.data.department.name,
                    key:currentTab+1,
                    parentId:res.data.data.department.id
                })
                this.tabDataList.push(res.data.data.children)
                this.activeTab = currentTab+1
            }).finally(()=>{
                this.id = null
            })
        },
        closeTab(deep){
            if(deep !== 1){
                this.tabList =this.tabList.filter((a, idx)=>idx !== (Number(deep)-1))
                this.tabDataList =  this.tabDataList.filter((v, idx)=>idx !==(Number(deep)-1))
                this.activeTab = Number(deep)-1
            }

        },


    }

})