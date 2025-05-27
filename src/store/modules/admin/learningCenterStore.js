import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useLearningCenterStore = defineStore('learningCenterStore', {
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
        structureCheck:[],
        userListLoading: false,
        userListParams: {
            page:1,
            per_page:10,
            search:null,
        },
        userList: [],
        userListTotal: 0,
        payload:{
            name: null,
            name_ru: null,
            name_en: null,
            users: []
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
            $ApiService.learningCenterService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                ...this.payload,
            }
            $ApiService.learningCenterService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _update(){
            this.saveLoading = true
            let data = {
                ...this.payload,
            }
            $ApiService.learningCenterService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _userList(infinite){
            this.userListLoading = true
            const params = {...this.userListParams}
            $ApiService.userService._index({params}).then((res)=>{
                const newData = res.data.data.data.map((v)=>({
                    id: v.worker.id,
                    ...v,
                    name:Utils.combineFullName(v.worker),
                    position:v?.phone,
                }))
                const oldData = this.userList
                const data = infinite ? [...oldData, ...newData] : [...newData]
                this.payload.users.forEach(user => {
                    if(!data.find(i=>i.id===user)){
                        data.push(oldData.find(i=>i.id===user))
                    }
                })
                this.userList = data
                this.userListTotal = res.data.data.total
            }).finally(()=>{
                this.userListLoading= false
            })
        },
        onSearchUserList(v){
            this.userListParams.page =1
            this.userListParams.search =v
            Utils.debouncedFn(this._userList)
        },
        onScrollUserList(e){
            const currentTarget = e.currentTarget;
            if(currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight && !this.userListLoading && this.userListTotal>this.userList.length){
                this.userListParams.page += 1
                this._userList(true)
            }
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.learningCenterService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.name = null
            this.payload.name_ru = null
            this.payload.name_en = null
            this.payload.users = []
        }
    }
})